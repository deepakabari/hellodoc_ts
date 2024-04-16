import httpCode from '../../../constants/http.constant';
import messageConstant from '../../../constants/message.constant';
import { Controller, ShiftWhereAttributes } from '../../../interfaces';
import dotenv from 'dotenv';
dotenv.config();
import { Shift, User } from '../../../db/models/index';
import transporter from '../../../utils/email';
import { compileEmailTemplate } from '../../../utils/hbsCompiler';
import sequelize from 'sequelize';
import { Op } from 'sequelize';

export const viewSchedule: Controller = async (req, res) => {
    try {
        const id = req.user.id;
        const { month } = req.query;

        const monthNumber: number | undefined =
            typeof month === 'string' ? parseInt(month, 10) - 1 : undefined;

        let whereCondition: ShiftWhereAttributes = {
            isDeleted: false,
        };

        if (monthNumber !== undefined) {
            // Filter by month if only the month is provided
            whereCondition[Op.and] = [
                sequelize.where(
                    sequelize.fn('MONTH', sequelize.col('shiftDate')),
                    monthNumber + 1,
                ),
            ];
        }

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

        if (!viewSchedule.length) {
            return res.status(httpCode.BAD_REQUEST).json({
                status: httpCode.BAD_REQUEST,
                message: messageConstant.DATA_NOT_FOUND,
            });
        }

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
