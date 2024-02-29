import jwt from "jsonwebtoken";
import httpCode from "../constants/http.constant";
import messageConstant from "../constants/message.constant";
import { Request, Response, NextFunction } from "express";
import dotenv from 'dotenv'
dotenv.config();

const SECRET = process.env.SECRET as string;

interface DecodedToken {
    user: {
        userId: string;
    };
}

interface AuthRequest extends Request {
    userId?: string; // Add the userId property as optional
}

export default (req: AuthRequest, res: Response, next: NextFunction): void => {
    const authHeader: string | undefined = req.get("Authorization");

    if (!authHeader) {
        const error: any = new Error(messageConstant.NOT_AUTHORIZED);
        error.statusCode = httpCode.UNAUTHORIZED;
        throw error;
    }

    const token: string = authHeader.split(" ")[1];
    let decodedToken: DecodedToken;

    try {
        decodedToken = jwt.verify(token, SECRET) as DecodedToken;
    } catch (error: any) {
        error.statusCode = httpCode.INTERNAL_SERVER_ERROR;
        throw error;
    }

    if (!decodedToken) {
        const error: any = messageConstant.NOT_AUTHORIZED;
        error.statusCode = httpCode.UNAUTHORIZED;
        throw error;
    }

    req.userId = decodedToken.user.userId;
    next();
};
