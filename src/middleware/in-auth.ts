import jwt from 'jsonwebtoken';
import httpCode from '../constants/http.constant';
import messageConstant from '../constants/message.constant';
import { Request, Response, NextFunction } from 'express';
import { CustomJwtPayload } from '../interfaces';
import dotenv from 'dotenv';
import { logger } from '../utils/logger';
dotenv.config();

const SECRET = process.env.SECRET as string;

export default (req: Request, res: Response, next: NextFunction): void => {
    try {
        const authHeader: string | undefined = req.get('Authorization');

        if (!authHeader) {
            logger.info('Authorization header is missing');
            const error: any = new Error(messageConstant.NOT_AUTHORIZED);
            error.statusCode = httpCode.UNAUTHORIZED;
            throw error;
        }

        const token = authHeader.split(' ')[1];

        const decodedToken = jwt.verify(token, SECRET) as CustomJwtPayload;

        if (!decodedToken) {
            logger.warn('Token could not be decoded');
            const error: any = messageConstant.NOT_AUTHORIZED;
            error.statusCode = httpCode.UNAUTHORIZED;
            throw error;
        }
        req.user = decodedToken;
        logger.info(`User ${req.user.id} is authorized`);
        next();
    } catch (error: any) {
        logger.error('An error occurred during authorization', error);
        error.statusCode = httpCode.INTERNAL_SERVER_ERROR;
        throw error;
    }
};
