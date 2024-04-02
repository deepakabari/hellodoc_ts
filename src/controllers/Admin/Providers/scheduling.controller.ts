import { AccountType, OnCallStatus } from '../../../utils/enum.constant';
import httpCode from '../../../constants/http.constant';
import messageConstant from '../../../constants/message.constant';
import { Region, Shift, User } from '../../../db/models/index';
import { Controller, ShiftWhereAttributes, Group } from '../../../interfaces';
import dotenv from 'dotenv';
import { Op } from 'sequelize';
import sequelize from 'sequelize';
import { any } from 'joi';
dotenv.config();

/**
 * @function providerOnCall
 * @param req - The HTTP request object.
 * @param res - The HTTP response object for sending back the gathered data.
 * @returns - A JSON response with the status code, message, and data of providers.
 */
export const providerOnCall: Controller = async (req, res) => {
    try {
        const { regions } = req.query;

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
                    where: { ...(regions ? { name: regions as string } : {}) },
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
            data: providers,
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
            message: messageConstant.SHIFT_CREATED,
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
            message: messageConstant.SHIFT_RETRIEVED,
            data: viewShift,
        });
    } catch (error) {
        throw error;
    }
};

/**
 * @function viewShiftByDate
 * @param req - Express Request object
 * @param res - Express response object used to send the response.
 * @returns - Returns a Promise that resolves to an Express response object. The response contains the status code, a success message, and the view shift data.
 * @description This function is an Express controller that retrieves the shift data of all physicians and sends the data in the response.
 */
export const viewShiftFilter: Controller = async (req, res) => {
    try {
        // Extract data from request params
        const { date, month, startDate, endDate, regions } = req.query as {
            date: string;
            month: string;
            regions: string;
            startDate: string;
            endDate: string;
        };

        // Extract query parameters
        const dateString: string = typeof date === 'string' ? date : '';

        const monthNumber: number | undefined =
            typeof month === 'string' ? parseInt(month, 10) - 1 : undefined;

        const startDateString: string =
            typeof startDate === 'string' ? startDate : '';
        const endDateString: string =
            typeof endDate === 'string' ? endDate : '';

        // Initialize the WHERE condition for the database query
        let whereCondition: ShiftWhereAttributes = {
            isDeleted: false
        };

        if (dateString) {
            // Filter by specific date if provided
            whereCondition.shiftDate = {
                [Op.eq]: new Date(dateString),
            };
        } else if (monthNumber !== undefined) {
            // Filter by month if only the month is provided
            whereCondition[Op.and] = [
                sequelize.where(
                    sequelize.fn('MONTH', sequelize.col('shiftDate')),
                    monthNumber + 1,
                ),
            ];
        } else if (startDateString && endDateString) {
            // Filter by week if the week is provided.
            whereCondition.shiftDate = {
                [Op.between]: [
                    new Date(startDateString),
                    new Date(endDateString),
                ],
            };
        }

        // Add region-based filtering if regions are provided
        if (regions) {
            whereCondition.region = regions;
        }

        // Retrieve data from the database
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

        if (viewShiftByDate.length === 0) {
            return res.status(httpCode.BAD_REQUEST).json({
                status: httpCode.BAD_REQUEST,
                message: messageConstant.DATA_NOT_FOUND,
            });
        }

        // Return the results as a JSON response
        return res.status(httpCode.OK).json({
            status: httpCode.OK,
            message: messageConstant.SHIFT_RETRIEVED,
            data: viewShiftByDate,
        });
    } catch (error) {
        throw error;
    }
};

/**
 * @function unApprovedViewShift
 * @param req - Express request object
 * @param res - Express response object
 * @returns - Returns a JSON response with unapproved shifts data
 * @description Retrieves unapproved shifts from the database and includes physician information.
 */
export const unApprovedViewShift: Controller = async (req, res) => {
    try {
        const regions = req.query.regions as string;

        // Retrieve unapproved shifts with specific attributes and include physician details
        const unApprovedViewShift = await Shift.findAll({
            attributes: ['id', 'shiftDate', 'startTime', 'endTime', 'region'],
            where: {
                isApproved: false,
                isDeleted: false,
                ...(regions ? { state: regions as string } : {}),
            },
            include: {
                model: User,
                as: 'physician',
                attributes: [
                    [
                        sequelize.fn(
                            'CONCAT',
                            sequelize.col('firstName'),
                            ' ',
                            sequelize.col('lastName'),
                        ),
                        'Physician Name',
                    ],
                ],
                where: {
                    id: sequelize.col('Shift.physicianId'),
                },
            },
        });

        if (unApprovedViewShift.length === 0) {
            return res.status(httpCode.BAD_REQUEST).json({
                status: httpCode.BAD_REQUEST,
                message: messageConstant.DATA_NOT_FOUND,
            });
        }

        // Respond with the unapproved shifts data
        return res.status(httpCode.OK).json({
            status: httpCode.OK,
            message: messageConstant.SHIFT_RETRIEVED,
            data: unApprovedViewShift,
        });
    } catch (error) {
        throw error;
    }
};

/**
 * @function approveShift
 * @param req - Express request object
 * @param res - Express response object
 * @returns - Returns a success message after updating shift approvals
 * @description Updates the 'isApproved' field to true for selected shifts.
 */
export const approveShift: Controller = async (req, res) => {
    try {
        const { shiftIds } = req.body;

        // Update 'isApproved' to true for each selected shift
        shiftIds.forEach(async (shiftId: string) => {
            await Shift.update(
                {
                    isApproved: true,
                },
                { where: { id: shiftId } },
            );
        });

        // Respond with a success message
        return res.status(httpCode.OK).json({
            status: httpCode.OK,
            message: messageConstant.SHIFT_APPROVED,
        });
    } catch (error) {
        throw error;
    }
};

export const deleteShift: Controller = async (req, res) => {
    try {
        const { shiftIds } = req.body;

        // Update 'isDeleted' to true for each selected shift
        shiftIds.forEach(async (shiftId: string) => {
            await Shift.update(
                {
                    isDeleted: true,
                },
                { where: { id: shiftId } },
            );
        });

        // Respond with a success message
        return res.status(httpCode.OK).json({
            status: httpCode.OK,
            message: messageConstant.SHIFT_DELETED,
        });
    } catch (error) {
        throw error;
    }
}