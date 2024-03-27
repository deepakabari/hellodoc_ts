import { AccountType, OnCallStatus } from '../../../utils/enum.constant';
import httpCode from '../../../constants/http.constant';
import messageConstant from '../../../constants/message.constant';
import { Region, Shift, User } from '../../../db/models/index';
import { Controller, ShiftWhereAttributes } from '../../../interfaces';
import dotenv from 'dotenv';
import { Op } from 'sequelize';
import sequelize from 'sequelize';
dotenv.config();

interface Provider {
    id: number;
    firstName: string;
    lastName: string;
    photo: string;
    regions: object;
}

interface Group {
    [key: string]: Provider[];
}

/**
 * @function providerOnCall
 * @param req - The HTTP request object.
 * @param res - The HTTP response object for sending back the gathered data.
 * @returns - A JSON response with the status code, message, and data of providers.
 */
export const providerOnCall: Controller = async (req, res) => {
    try {
        // Fetch providers with 'onCallStatus' of either 'OnCall' or 'UnAvailable'.
        const providers = await User.findAll({
            attributes: [
                'id',
                'photo',
                'firstName',
                'lastName',
                'onCallStatus',
            ],
            where: {
                accountType: AccountType.Physician,
                onCallStatus: {
                    [Op.or]: [OnCallStatus.OnCall, OnCallStatus.UnAvailable],
                },
            },
            include: [
                {
                    model: Region,
                    attributes: ['id', 'name'],
                    through: { attributes: [] }, // This will exclude the join table attributes
                },
            ],
            order: ['onCallStatus'],
        });

        // Group providers by their on-call status.
        const groupedProvider: Group = providers.reduce(
            (result: Group, user) => {
                const key = user.onCallStatus;
                if (!result[key]) {
                    result[key] = [];
                }
                result[key].push({
                    id: user.id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    photo: user.photo,
                    regions: user.regions.map((region) => ({
                        id: region.id,
                        name: region.name,
                    })),
                });
                return result;
            },
            {} as Group,
        );

        // Send the grouped providers data in the response.
        return res.status(httpCode.OK).json({
            status: httpCode.OK,
            message: messageConstant.SUCCESS,
            data: groupedProvider,
        });
    } catch (error) {
        // In case of an error, throw it to be handled by the error middleware.
        throw error;
    }
};

/**
 * @function addNewShift
 * @param req - The HTTP request object containing the shift details.
 * @param res - The HTTP response object for sending back the operation result.
 * @returns - A JSON response with the status code, message, and newly created shift data.
 */
export const addNewShift: Controller = async (req, res) => {
    try {
        // Extract shift details from the request body.
        const {
            region,
            physicianId,
            shiftDate,
            startTime,
            endTime,
            isRepeat,
            weekDays,
            repeatUpto,
        } = req.body;

        // Create a new shift record in the database.
        const newShift = await Shift.create({
            region,
            physicianId,
            shiftDate,
            startTime,
            endTime,
            isApproved: false,
        });

        // If the shift creation fails, send a bad request response.
        if (!newShift) {
            return res.status(httpCode.BAD_REQUEST).json({
                status: httpCode.BAD_REQUEST,
                message: messageConstant.SHIFT_CREATION_FAILED,
            });
        }

        // Send the newly created shift data in the response.
        return res.status(httpCode.OK).json({
            status: httpCode.OK,
            message: messageConstant.SUCCESS,
            data: newShift,
        });
    } catch (error) {
        throw error;
    }
};

/**
 * @function viewShift
 * @param req - The HTTP request object containing the shift ID.
 * @param res - The HTTP response object for sending back the shift details.
 * @returns - A JSON response with the status code, message, and data of the requested shift.
 */
export const viewShift: Controller = async (req, res) => {
    try {
        // Extract the shift ID from the request parameters.
        const { id } = req.params;

        // Fetch the shift details from the database using the provided ID.
        const viewShift = await Shift.findAll({
            attributes: [
                'id',
                'region',
                'shiftDate',
                'startTime',
                'endTime',
                'isApproved',
            ],
            include: [
                {
                    model: User,
                    attributes: ['id', 'firstName', 'lastName'],
                },
            ],
            where: { id },
        });

        if (viewShift.length === 0) {
            return res.status(httpCode.BAD_REQUEST).json({
                status: httpCode.BAD_REQUEST,
                message: messageConstant.DATA_NOT_FOUND,
            });
        }

        // Send the shift details data in the response.
        return res.status(httpCode.OK).json({
            status: httpCode.OK,
            message: messageConstant.SUCCESS,
            data: viewShift,
        });
    } catch (error) {
        throw error;
    }
};

/**
 * @function viewShiftByDate
 * @param req 
 * @param res 
 * @returns 
 */
export const viewShiftByDate: Controller = async (req, res) => {
    try {
        const { date, month, week } = req.query;

        const dateString: string = typeof date === 'string' ? date : '';

        const monthNumber: number | undefined =
            typeof month === 'string' ? parseInt(month, 10) - 1 : undefined;

        const weekNumber: number | undefined =
            typeof week === 'string' ? parseInt(week, 10) : undefined;

        let whereCondition: ShiftWhereAttributes = {};

        if (dateString) {
            whereCondition.shiftDate = {
                [Op.eq]: new Date(dateString),
            };
        } else if (monthNumber !== undefined && weekNumber === undefined) {
            // Filter by month if only the month is provided.
            whereCondition[Op.and] = [
                sequelize.where(
                    sequelize.fn('MONTH', sequelize.col('shiftDate')),
                    monthNumber + 1,
                ),
            ];
        } else if (weekNumber !== undefined) {
            // Filter by week if the week is provided.
            whereCondition[Op.and] = [
                sequelize.where(
                    sequelize.fn('WEEK', sequelize.col('shiftDate')),
                    weekNumber,
                ),
            ];
        }

        const viewShiftByDate = await Shift.findAll({
            attributes: [
                'id',
                'region',
                'shiftDate',
                'startTime',
                'endTime',
                'isApproved',
            ],
            include: [
                {
                    model: User,
                    attributes: ['id', 'firstName', 'lastName'],
                },
            ],
            where: whereCondition as any,
            order: [['shiftDate', 'ASC']],
        });

        return res.status(httpCode.OK).json({
            status: httpCode.OK,
            message: messageConstant.SUCCESS,
            data: viewShiftByDate,
        });
    } catch (error) {
        throw error;
    }
};
