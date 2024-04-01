import { Op } from 'sequelize';

// Define an interface for the where condition
interface ShiftWhereAttributes {
    shiftDate?: {
        [Op.eq]?: Date;
    };
    [Op.and]?: {
        [key: string]: any;
    }[];
    region?: any;
}

export { ShiftWhereAttributes };
