import fs from 'fs';
import { RequestStatus } from '../../../utils/enum.constant';
import httpCode from '../../../constants/http.constant';
import messageConstant from '../../../constants/message.constant';
import { Request, User } from '../../../db/models/index';
import { Controller } from '../../../interfaces';
import sequelize, { Order, col, where } from 'sequelize';
import { Op } from 'sequelize';
import json2xls from 'json2xls';
import { Request as ExpressRequest, Response } from 'express';
import dotenv from 'dotenv';
dotenv.config();

/**
 * Retrieves the history of patient requests from the database.
 * @param req - The Express Request object containing the incoming request data.
 * @param res - The Express Response object used to send back the desired HTTP response.
 * @returns - A promise that resolves to the Express Response object, which sends a JSON response containing the status code, success message, and the retrieved patients' history data.
 */
export const getPatientHistory: Controller = async (req, res) => {
    try {
        const { patientName, email, phone, page, pageSize } = req.query;

        const pageNumber = parseInt(page as string, 10) || 1;
        const limit = parseInt(pageSize as string, 10) || 10;
        const offset = (pageNumber - 1) * limit;

        const whereClause: any = {};
        if (patientName) {
            whereClause[Op.or] = [
                { patientFirstName: { [Op.like]: `%${patientName}%` } },
                { patientLastName: { [Op.like]: `%${patientName}%` } },
            ];
        }
        if (email) {
            whereClause.patientEmail = { [Op.like]: `%${email}%` };
        }
        if (phone) {
            whereClause.patientPhoneNumber = { [Op.like]: `%${phone}%` };
        }

        const patientsHistory = await Request.findAndCountAll({
            attributes: [
                'id',
                'userId',
                'patientFirstName',
                'patientLastName',
                'patientEmail',
                'patientPhoneNumber',
                'street',
                'city',
                'state',
                'zipCode',
            ],
            where: whereClause,
            limit,
            offset,
        });

        return res.status(httpCode.OK).json({
            status: httpCode.OK,
            message: messageConstant.SUCCESS,
            data: patientsHistory,
        });
    } catch (error) {
        throw error;
    }
};

/**
 * @function blockHistory - Retrieves a list of blocked requests from the database.
 * @param req - The Express Request object containing the incoming request data.
 * @param res - The Express Response object used to send back the desired HTTP response.
 * @returns - A promise that resolves to the Express Response object, which sends a JSON response containing the status code, success message, and the data of blocked requests.
 */
export const blockHistory: Controller = async (req, res) => {
    try {
        const { name, email, phone, date, sortBy, orderBy, page, pageSize } =
            req.query;

        const pageNumber = parseInt(page as string, 10) || 1;
        const limit = parseInt(pageSize as string, 10) || 10;
        const offset = (pageNumber - 1) * limit;

        let sortByModel: Order = [];

        if (sortBy && orderBy) {
            sortByModel = [[sortBy, orderBy]] as Order;
        }

        const whereClause: any = {
            requestStatus: RequestStatus.Blocked,
        };

        if (name) {
            whereClause[Op.or] = [
                { patientFirstName: { [Op.like]: `%${name}%` } },
                { patientLastName: { [Op.like]: `%${name}%` } },
            ];
        }
        if (email) {
            whereClause.patientEmail = { [Op.like]: `%${email}%` };
        }
        if (phone) {
            whereClause.patientPhoneNumber = { [Op.like]: `%${phone}%` };
        }
        if (date) {
            whereClause.createdAt = { [Op.like]: `%${date}%` };
        }

        const blockRequests = await Request.findAndCountAll({
            attributes: [
                'id',
                'patientFirstName',
                'patientLastName',
                'patientPhoneNumber',
                'patientEmail',
                'createdAt',
                'patientNote',
            ],
            where: whereClause,
            order: sortByModel,
            limit,
            offset,
        });

        return res.status(httpCode.OK).json({
            status: httpCode.OK,
            message: messageConstant.SUCCESS,
            data: blockRequests,
        });
    } catch (error) {
        throw error;
    }
};

/**
 * @function patientRecord
 * @param req - Express request object, expects `state` in the query parameters.
 * @param res - Express response object used to send the response.
 * @returns - A promise that resolves to the response object with the status code, message, and patient data.
 * @throws Throws an error if there's an issue in the execution of the function.
 */
export const patientRecord: Controller = async (req, res) => {
    try {
        const { id } = req.params;
        const { sortBy, orderBy } = req.query;

        let sortByModel: Order = [];

        if (sortBy && orderBy) {
            sortByModel = [[sortBy, orderBy]] as Order;
        }

        const patients = await Request.findAndCountAll({
            attributes: [
                'id',
                'patientFirstName',
                'patientLastName',
                'createdAt',
                'confirmationNumber',
                'concludedDate',
                'requestStatus',
            ],
            include: {
                model: User,
                as: 'physician',
                attributes: ['id', 'firstName', 'lastName'],
                where: { id: sequelize.col('Request.physicianId') },
            },
            where: { userId: id },
            order: sortByModel,
        });

        return res.status(httpCode.OK).json({
            status: httpCode.OK,
            message: messageConstant.SUCCESS,
            data: patients,
        });
    } catch (error) {
        throw error;
    }
};

export const searchRecord: Controller = async (req, res) => {
    try {
        const {
            requestStatus,
            patientName,
            requestType,
            email,
            phoneNumber,
            sortBy,
            orderBy,
            fromDate,
            toDate,
            page,
            pageSize,
            physicianName,
        } = req.query;

        const pageNumber = parseInt(page as string, 10) || 1;
        const limit = parseInt(pageSize as string, 10) || 10;
        const offset = (pageNumber - 1) * limit;

        const whereClause: any = {};

        if (fromDate && toDate) {
            whereClause.updatedAt = {
                [Op.between]: [
                    new Date(fromDate as string),
                    new Date(toDate as string),
                ],
            };
        }

        let sortByModel: Order = [];

        if (sortBy && orderBy) {
            sortByModel = [[sortBy, orderBy]] as Order;
        }

        if (patientName) {
            whereClause[Op.or] = [
                { patientFirstName: { [Op.like]: `%${patientName}%` } },
                { patientLastName: { [Op.like]: `%${patientName}%` } },
            ];
        }
        if (requestStatus) {
            whereClause.requestStatus = { [Op.like]: `%${requestStatus}%` };
        }
        if (requestType) {
            whereClause.requestType = { [Op.like]: `%${requestType}%` };
        }
        if (email) {
            whereClause.patientEmail = { [Op.like]: `%${email}%` };
        }
        if (phoneNumber) {
            whereClause.patientPhoneNumber = { [Op.like]: `%${phoneNumber}%` };
        }

        const patientData = await Request.findAndCountAll({
            attributes: [
                'id',
                'patientFirstName',
                'patientLastName',
                'requestType',
                'acceptedDate',
                'updatedAt',
                'patientEmail',
                'patientPhoneNumber',
                'street',
                'city',
                'state',
                'zipCode',
                'requestStatus',
                'physicianNotes',
                'reasonForCancellation',
                'adminNotes',
                'patientNote',
            ],
            include: {
                model: User,
                as: 'physician',
                attributes: ['id', 'firstName', 'lastName'],
                where: {
                    [Op.or]: [
                        {
                            id: sequelize.col('Request.physicianId'),
                        },
                    ],
                },
            },
            order: sortByModel,
            where: whereClause,
            limit,
            offset,
        });

        return res.status(httpCode.OK).json({
            status: httpCode.OK,
            message: messageConstant.SUCCESS,
            data: patientData,
        });
    } catch (error) {
        throw error;
    }
};

export const unBlockPatient: Controller = async (req, res) => {
    try {
        const { id } = req.params;

        await Request.update(
            {
                requestStatus: RequestStatus.Unassigned,
                isDeleted: false,
            },
            { where: { id } },
        );

        return res.status(httpCode.OK).json({
            status: httpCode.OK,
            message: messageConstant.PATIENT_UNBLOCK,
        });
    } catch (error) {
        throw error;
    }
};

export const deleteRecord: Controller = async (req, res) => {
    try {
        const { id } = req.params;

        await Request.destroy({
            where: { id },
        });

        return res.status(httpCode.OK).json({
            status: httpCode.OK,
            message: messageConstant.REQUEST_DELETED,
        });
    } catch (error) {
        throw error;
    }
};

export const exportToExcel = async (req: ExpressRequest, res: Response) => {
    try {
        const token = req.headers.authorization as string;

        const response = await fetch(
            'http://localhost:4000/admin/records/searchRecord',
            {
                headers: {
                    Authorization: token,
                },
            },
        );

        if (!response.ok) {
            throw new Error(`Failed to fetch data: ${response.statusText}`);
        }

        const jsonData: any = await response.json();

        const xls = json2xls(jsonData.data);

        const filename = `records_patients_${Date.now()}.xlsx`;
        fs.writeFileSync(filename, xls, 'binary');

        return res.download(filename, filename, () => {
            // Delete the file after download completes
            fs.unlinkSync(filename);
        });
    } catch (error) {
        throw error;
    }
};
