import { isCelebrateError } from 'celebrate';
import httpCode from '../constants/http.constant';
import { Request, Response, NextFunction } from 'express';
import messageConstant from '../constants/message.constant';
import { logger } from '../utils/logger';

export const validation = (
    error: Error,
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    if (!isCelebrateError(error)) {
        logger.error('Non-celebrate error encountered', { error });
        throw error;
    }

    let errorDetails;

    if (error.details.get('body')) {
        const { details } = error.details.get('body') as any;
        errorDetails = details;
    } else if (error.details.get('query')) {
        const { details } = error.details.get('query') as any;
        errorDetails = details;
    } else if (error.details.get('params')) {
        const { details } = error.details.get('params') as any;
        errorDetails = details;
    }

    if (!errorDetails) {
        throw error;
    }

    const message = errorDetails
        .map((i: any) => i.message.replace(/['"]+/g, ''))
        .join(',');

    logger.error('Validation error', { message });
    return res.status(httpCode.BAD_REQUEST).json({
        statusCode: httpCode.BAD_REQUEST,
        error: messageConstant.BAD_REQUEST,
        message: messageConstant.VALIDATION_FAILED,
        validation: {
            keys: [errorDetails[0].context.key],
            message,
        },
    });
};
