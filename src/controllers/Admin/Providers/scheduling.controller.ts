import { AccountType, OnCallStatus } from '../../../utils/enum.constant';
import httpCode from '../../../constants/http.constant';
import messageConstant from '../../../constants/message.constant';
import { Region, Shift, User } from '../../../db/models/index';
import { Controller, ShiftWhereAttributes, Group } from '../../../interfaces';
import dotenv from 'dotenv';
import { Op, Order } from 'sequelize';
import { sequelize } from '../../../db/config/db.connection';
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
        const currentDate = new Date();
        const currentTime = currentDate.getTime();

        // Fetch providers with 'onCallStatus' of either 'OnCall' or 'UnAvailable'.
        const providers = await User.findAll({
            attributes: ['id', 'photo', 'firstName', 'lastName'],
            where: {
                accountType: AccountType.Physician,
            },
            include: [
                {
                    model: Region,
                    attributes: ['id', 'name'],
                    through: { attributes: [] }, // This will exclude the join table attributes
                    where: { ...(regions ? { name: regions as string } : {}) },
                },
                {
                    model: Shift,
                    as: 'physicianShifts',
                    attributes: ['shiftDate', 'startTime', 'endTime'],
                    required: false,
                },
            ],
            order: ['lastName', 'firstName'],
        });

        // Process the providers to determine onCallStatus and update the User table
        const processedProviders = await Promise.all(
            providers.map(async (provider) => {
                const onCallShift = provider.physicianShifts?.find((shift) => {
                    const shiftDate = new Date(shift.shiftDate);
                    const startTimeArray = shift.startTime
                        .split(':')
                        .map(Number);
                    const endTimeArray = shift.endTime.split(':').map(Number);
                    const startTime = new Date(shiftDate);
                    startTime.setHours(
                        startTimeArray[0],
                        startTimeArray[1],
                        0,
                        0,
                    );
                    const endTime = new Date(shiftDate);
                    endTime.setHours(endTimeArray[0], endTimeArray[1], 0, 0);

                    return (
                        shiftDate.toDateString() ===
                            currentDate.toDateString() &&
                        currentTime >= startTime.getTime() &&
                        currentTime <= endTime.getTime()
                    );
                });

                const onCallStatus = onCallShift
                    ? OnCallStatus.OnCall
                    : OnCallStatus.UnScheduled;

                // Update the onCallStatus in the User table
                await provider.update({ onCallStatus });

                return {
                    ...provider.get({ plain: true }),
                    onCallStatus,
                };
            }),
        );

        // Send the grouped providers data in the response.
        return res.status(httpCode.OK).json({
            status: httpCode.OK,
            message: messageConstant.PROVIDER_RETRIEVED,
            data: processedProviders,
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
        let {
            accountType,
            region,
            physicianId,
            shiftDate,
            startTime,
            endTime,
            isRepeat,
            sunday,
            monday,
            tuesday,
            wednesday,
            thursday,
            friday,
            saturday,
            repeatUpto,
        } = req.body;

        // If the accountType is 'Physician', set the physicianId to the logged-in user's id.
        if (accountType === 'Physician') {
            physicianId = req.user.id;
        }

        const newShift = await Shift.create({
            region,
            physicianId,
            shiftDate,
            startTime,
            endTime,
            isRepeat,
            sunday,
            monday,
            tuesday,
            wednesday,
            thursday,
            friday,
            saturday,
            repeatUpto,
        });

        // If the shift creation fails, send a bad request response.
        if (!newShift) {
            return res.status(httpCode.BAD_REQUEST).json({
                status: httpCode.BAD_REQUEST,
                message: messageConstant.SHIFT_CREATION_FAILED,
            });
        }

        if (isRepeat && repeatUpto) {
            const repeatDays = [
                sunday,
                monday,
                tuesday,
                wednesday,
                thursday,
                friday,
                saturday,
            ];
            let weeksToAdd = parseInt(repeatUpto, 10);
            let currentDate = new Date(shiftDate);

            for (let week = 0; week < weeksToAdd; week++) {
                for (let i = 1; i <= 7; i++) {
                    let nextShiftDate = new Date(currentDate);
                    nextShiftDate.setDate(nextShiftDate.getDate() + i);

                    if (repeatDays[nextShiftDate.getDay()]) {
                        if (nextShiftDate >= currentDate) {
                            await Shift.create({
                                region,
                                physicianId,
                                shiftDate: nextShiftDate,
                                startTime,
                                endTime,
                                sunday,
                                monday,
                                tuesday,
                                wednesday,
                                thursday,
                                friday,
                                saturday,
                            });
                        }
                    }
                }
                currentDate.setDate(currentDate.getDate() + 7); // Move to the next week
            }
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

        const exists = await Shift.findByPk(id);
        if (!exists) {
            return res.status(httpCode.BAD_REQUEST).json({
                status: httpCode.BAD_REQUEST,
                message: messageConstant.SHIFT_NOT_FOUND,
            });
        }

        // Fetch the shift details from the database using the provided ID.
        const viewShift = await Shift.findAll({
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
            include: [
                {
                    model: User,
                    attributes: ['id', 'firstName', 'lastName'],
                },
            ],
            where: { id },
        });

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
            isDeleted: false,
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
            include: [
                {
                    model: User,
                    attributes: ['id', 'firstName', 'lastName'],
                },
            ],
            where: whereCondition as any,
            order: [['shiftDate', 'ASC']],
        });

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
        // Extract query parameters
        const { regions, page, pageSize, sortBy, orderBy } = req.query;

        // Parse pagination parameters
        const pageNumber = parseInt(page as string, 10) || 1;
        const limit = parseInt(pageSize as string, 10) || 10;
        const offset = (pageNumber - 1) * limit;

        // Define sorting options
        const order =
            sortBy && orderBy
                ? ([
                      [{ model: User, as: 'physician' }, sortBy, orderBy],
                  ] as Order)
                : [];

        // Retrieve unapproved shifts with specific attributes and include physician details
        const unApprovedViewShift = await Shift.findAndCountAll({
            attributes: ['id', 'shiftDate', 'startTime', 'endTime', 'region'],
            where: {
                isApproved: false,
                isDeleted: false,
                ...(regions ? { region: regions as string } : {}),
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
            order,
            limit,
            offset,
        });

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
    const transaction = await sequelize.transaction();
    try {
        // Extract query parameters
        const { shiftIds } = req.body;

        // Update 'isApproved' to true for each selected shift
        for (const shiftId of shiftIds) {
            await Shift.update(
                {
                    isApproved: true,
                },
                { where: { id: shiftId }, transaction },
            );
        }

        await transaction.commit();

        // Respond with a success message
        return res.status(httpCode.OK).json({
            status: httpCode.OK,
            message: messageConstant.SHIFT_APPROVED,
        });
    } catch (error) {
        await transaction.rollback();
        throw new Error(messageConstant.ERROR_APPROVE_SHIFT);
    }
};

export const deleteShift: Controller = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { shiftIds } = req.body;

        // Update 'isDeleted' to true for each selected shift
        for (const shiftId of shiftIds) {
            await Shift.update(
                {
                    isDeleted: true,
                },
                { where: { id: shiftId }, transaction },
            );
        }

        await transaction.commit();

        // Respond with a success message
        return res.status(httpCode.OK).json({
            status: httpCode.OK,
            message: messageConstant.SHIFT_DELETED,
        });
    } catch (error) {
        await transaction.rollback();
        throw new Error(messageConstant.ERROR_DELETE_SHIFT);
    }
};

export const editShift: Controller = async (req, res) => {
    try {
        // Extract shift ID from request parameters
        const { id } = req.params;

        // Extract shift details from request body
        const { shiftDate, startTime, endTime } = req.body;

        // Check if the shift exists
        const exists = await Shift.findByPk(id);
        if (!exists) {
            return res.status(httpCode.BAD_REQUEST).json({
                status: httpCode.BAD_REQUEST,
                message: messageConstant.SHIFT_NOT_FOUND,
            });
        }

        // Update the shift with the provided details
        await Shift.update(
            { shiftDate, startTime, endTime },
            { where: { id } },
        );

        // Respond with success message
        return res.status(httpCode.OK).json({
            status: httpCode.OK,
            message: messageConstant.SHIFT_UPDATED,
        });
    } catch (error) {
        throw error;
    }
};

export const toggleShiftApproval: Controller = async (req, res) => {
    try {
        // Extract shift ID from request parameters
        const { id } = req.params;

        // Find the shift by its ID
        const shift = await Shift.findByPk(id);

        // Check if the shift exists
        if (!shift) {
            return res.status(httpCode.BAD_REQUEST).json({
                status: httpCode.BAD_REQUEST,
                message: messageConstant.SHIFT_NOT_FOUND,
            });
        }

        // Toggle the approval status of the shift
        shift.isApproved = !shift.isApproved;

        // Save the updated shift
        await shift.save();

        // Respond with success message
        return res.status(httpCode.OK).json({
            status: httpCode.OK,
            message: messageConstant.SHIFT_UPDATED,
        });
    } catch (error) {
        throw error;
    }
};
