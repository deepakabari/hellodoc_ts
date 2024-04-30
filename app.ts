import express, { NextFunction, Request, Response } from 'express';
import router from './src/routes/index';
import { dbConnection } from './src/db/config/index';
import path from 'path';
import bodyParser from 'body-parser';
import { errorHandler } from './src/utils/errorHandler';
import { engine } from 'express-handlebars';
import dotenv from 'dotenv';
import json2xls from 'json2xls';
import httpCode from './src/constants/http.constant';
import messageConstant from './src/constants/message.constant';
import { validation } from './src/middleware/validation';
import { logger } from './src/utils/logger';
dotenv.config();

const PORT = process.env.PORT;

const app = express();

app.engine('hbs', engine({ extname: 'hbs', defaultLayout: false }));
app.set('view engine', 'hbs');

app.use(
    '/images',
    express.static(path.join(__dirname, 'src', 'public')),
);

app.use(json2xls.middleware);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use((req: Request, res: Response, next: NextFunction) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
        'Access-Control-Allow-Methods',
        'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    );
    res.setHeader(
        'Access-Control-Allow-Headers',
        'Content-Type, Authorization',
    );
    next();
});
app.use(router);
app.use(validation);

app.get('/', (req: Request, res: Response) => {
    res.send('API is working...');
});

app.use('*', (req: Request, res: Response) => {
    res.status(httpCode.NOT_FOUND).json({
        status: httpCode.NOT_FOUND,
        message: messageConstant.ACCESS_DENIED,
    });
});

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error('>> err: ', err); // Log the error for debugging purposes
    const statusCode = err.statusCode || 500;
    const errorMessage = err.message || 'Internal Server Error';
    res.status(statusCode).json({ statusCode, errorMessage });
});

app.use(errorHandler);
dbConnection();

app.listen(PORT, () => {
    logger.info(
        `Port ${PORT} has been conquered! Our server flag is flying high!`,
    );
});
