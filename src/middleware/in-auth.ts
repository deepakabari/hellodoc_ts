import jwt, { JwtPayload } from "jsonwebtoken";
import httpCode from "../constants/http.constant";
import messageConstant from "../constants/message.constant";
import { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
dotenv.config();

const SECRET = process.env.SECRET as string;

export default (req: Request, res: Response, next: NextFunction): void => {
    try {
        const authHeader: string | undefined = req.get("Authorization");

        if (!authHeader) {
            const error: any = new Error(messageConstant.NOT_AUTHORIZED);
            error.statusCode = httpCode.UNAUTHORIZED;
            throw error;
        }

        const token = authHeader.split(" ")[1];
        
        const decodedToken = jwt.verify(token, SECRET) as jwt.JwtPayload;
        
        if (!decodedToken) {
            const error: any = messageConstant.NOT_AUTHORIZED;
            error.statusCode = httpCode.UNAUTHORIZED;
            throw error;
        }

        req.user = decodedToken.user;
        next();
    } catch (error: any) {
        error.statusCode = httpCode.INTERNAL_SERVER_ERROR;
        throw error;
    }
};
