import httpCode from '../../../constants/http.constant';
import messageConstant from '../../../constants/message.constant';
import { Controller, ShiftWhereAttributes } from '../../../interfaces';
import dotenv from 'dotenv';
dotenv.config();
import { Shift } from '../../../db/models/index';
import sequelize from 'sequelize';
import { Op } from 'sequelize';

export const viewSchedule: Controller = async (req, res) => {
    try {
        // Extract the user ID from the request
        const id = req.user.id;

        // Extract the month from the query parameters
        const { month } = req.query;

        // Convert the month to a number if provided
        const monthNumber: number | undefined =
            typeof month === 'string' ? parseInt(month, 10) - 1 : undefined;

        // Define the where condition for filtering shifts
        let whereCondition: ShiftWhereAttributes = {
            isDeleted: false,
        };

        // If month is provided, filter by month
        if (monthNumber !== undefined) {
            // Filter by month if only the month is provided
            whereCondition[Op.and] = [
                sequelize.where(
                    sequelize.fn('MONTH', sequelize.col('shiftDate')),
                    monthNumber + 1,
                ),
            ];
        }

        // Retrieve the schedule of the physician from the database
        const viewSchedule = await Shift.findAll({
            attributes: [
                'id',
                'region',
                'shiftDate',
                'startTime',
                'endTime',
                'isApproved',
                'isRepeat',
                'sunday',
                'monday',
                'tuesday',
                'wednesday',
                'thursday',
                'friday',
                'saturday',
                'repeatUpto',
            ],
            where: {
                physicianId: id,
                ...whereCondition,
            },
        });

        // Send the shift details data in the response.
        return res.status(httpCode.OK).json({
            status: httpCode.OK,
            message: messageConstant.SHIFT_RETRIEVED,
            data: viewSchedule,
        });
    } catch (error) {
        throw error;
    }
};
