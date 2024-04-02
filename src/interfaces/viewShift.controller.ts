import { Op } from 'sequelize';

// Define an interface for the where condition
interface ShiftWhereAttributes {
    shiftDate?: {
        [Op.eq]?: Date;
        [Op.between]?: Date[];
    };

    [Op.and]?: {
        [key: string]: any;
    }[];

    region?: any;
    isDeleted?: boolean
}

export { ShiftWhereAttributes };
