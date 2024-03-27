import { Op } from 'sequelize';

// Define an interface for the query parameters
interface QueryParams {
    date?: string;
    month?: string;
    week?: string;
}

// Define an interface for the where condition
interface ShiftWhereAttributes {
    shiftDate?: {
        [Op.eq]?: Date;
    };
    [Op.and]?: {
        [key: string]: any;
    }[];
}

export { QueryParams, ShiftWhereAttributes };
