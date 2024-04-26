import { Sequelize } from 'sequelize-typescript';
import {
    User,
    Request,
    Role,
    Region,
    UserRegion,
    RequestWiseFiles,
    Business,
    OrderDetail,
    Shift,
    Permission,
    RolePermissionMap,
    EmailLog,
    SMSLog,
    MedicalReport,
} from '../models/index';
import { logger } from '../../utils/logger';

import dotenv from 'dotenv';
dotenv.config();

const dbName = process.env.DB_NAME as string;
const dbUser = process.env.DB_USER as string;
const dbHost = process.env.DB_HOST;
const dbPassword = process.env.DB_PASSWORD;

export const sequelize = new Sequelize(dbName, dbUser, dbPassword, {
    host: dbHost,
    dialect: 'mysql',
    define: {
        freezeTableName: true,
    },
    models: [
        User,
        Request,
        Role,
        Region,
        UserRegion,
        RequestWiseFiles,
        Business,
        OrderDetail,
        Shift,
        Permission,
        RolePermissionMap,
        EmailLog,
        SMSLog,
        MedicalReport,
    ],
    logging: (msg) => {
        if (msg === 'Executing (default): SELECT 1+1 AS result') {
            logger.info(
                'The database is now our best friend. Connection achieved!',
            );
        } else {
            logger.info(msg);
        }
    },
});

export const dbConnection = async (): Promise<Sequelize> => {
    await sequelize
        .authenticate()
        .then(() => {
            logger.info('The database just swiped right. It’s a match!');
        })
        .catch((err: Error) =>
            logger.error('Unable to connect to the database.', err),
        );
    return sequelize;
};
