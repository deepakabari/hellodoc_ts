import httpCode from "../constants/http.constant";
import messageConstant from "../constants/message.constant";
import { Request, Response } from "express";

const AppError =  (error: Error, req: Request, res: Response): Response => {
    return res.status(httpCode.INTERNAL_SERVER_ERROR).json({
        status: httpCode.INTERNAL_SERVER_ERROR,
        message: messageConstant.INTERNAL_SERVER_ERROR,
        data: error,
    });
};
 
export default AppError;