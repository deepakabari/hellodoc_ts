import { AccountType, OnCallStatus } from '../../../utils/enum.constant';
import httpCode from '../../../constants/http.constant';
import messageConstant from '../../../constants/message.constant';
import { Region, Shift, User } from '../../../db/models/index';
import { Controller } from '../../../interfaces';
import dotenv from 'dotenv';
import { Op } from 'sequelize';
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
        const { region, physicianId, shiftDate, startTime, endTime } = req.body;

        // Create a new shift record in the database.
        const newShift = await Shift.create({
            region,
            physicianId,
            shiftDate,
            startTime,
            endTime,
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
            attributes: ['id', 'region', 'shiftDate', 'startTime', 'endTime'],
            where: { id },
        });

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
