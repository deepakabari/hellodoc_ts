import fs from 'fs';
import { RequestStatus } from '../../../utils/enum.constant';
import httpCode from '../../../constants/http.constant';
import messageConstant from '../../../constants/message.constant';
import {
    EmailLog,
    Request,
    Role,
    SMSLog,
    User,
} from '../../../db/models/index';
import { Controller, RequestAttributes } from '../../../interfaces';
import sequelize, { Order, WhereOptions, col, where } from 'sequelize';
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
        const { firstName, lastName, email, phone, page, pageSize } = req.query;

        const pageNumber = parseInt(page as string, 10) || 1;
        const limit = parseInt(pageSize as string, 10) || 10;
        const offset = (pageNumber - 1) * limit;

        const whereClause: WhereOptions<RequestAttributes> = {};
        if (firstName) {
            whereClause.patientFirstName = { [Op.substring]: `${firstName}` };
        }
        if (lastName) {
            whereClause.patientLastName = { [Op.substring]: `${lastName}` };
        }
        if (email) {
            whereClause.patientEmail = { [Op.substring]: `${email}` };
        }
        if (phone) {
            whereClause.patientPhoneNumber = { [Op.substring]: `${phone}` };
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
                { patientFirstName: { [Op.substring]: `${name}` } },
                { patientLastName: { [Op.substring]: `${name}` } },
            ];
        }
        if (email) {
            whereClause.patientEmail = { [Op.substring]: `${email}` };
        }
        if (phone) {
            whereClause.patientPhoneNumber = { [Op.substring]: `${phone}` };
        }
        if (date) {
            whereClause.createdAt = { [Op.substring]: `${date}` };
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
            include: [
                { model: User, as: 'user', attributes: ['id', 'status'] },
            ],
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
        const { sortBy, orderBy, page, pageSize } = req.query;

        const pageNumber = parseInt(page as string, 10) || 1;
        const limit = parseInt(pageSize as string, 10) || 10;
        const offset = (pageNumber - 1) * limit;

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
            limit,
            offset,
        });

        return res.status(httpCode.OK).json({
            status: httpCode.OK,
            message: messageConstant.SUCCESS,
            data: { patients, id },
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
                { patientFirstName: { [Op.substring]: `${patientName}` } },
                { patientLastName: { [Op.substring]: `${patientName}` } },
            ];
        }
        if (requestStatus) {
            whereClause.requestStatus = { [Op.substring]: `${requestStatus}` };
        }
        if (requestType) {
            whereClause.requestType = { [Op.substring]: `${requestType}` };
        }
        if (email) {
            whereClause.patientEmail = { [Op.substring]: `${email}` };
        }
        if (phoneNumber) {
            whereClause.patientPhoneNumber = {
                [Op.substring]: `${phoneNumber}`,
            };
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
                    id: sequelize.col('Request.physicianId'),
                    ...(physicianName
                        ? {
                              [Op.or]: [
                                  {
                                      firstName: {
                                          [Op.substring]: `${physicianName}`,
                                      },
                                  },
                                  {
                                      lastName: {
                                          [Op.substring]: `${physicianName}`,
                                      },
                                  },
                              ],
                          }
                        : {}),
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

        const formattedData = jsonData.data.rows.map((row: any) => {
            return {
                ...row,
                physicianId: row.physician.id,
                physicianFirstName: row.physician.firstName,
                physicianLastName: row.physician.lastName,
            };
        });

        const xls = json2xls(formattedData);

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

export const emailLog: Controller = async (req, res) => {
    try {
        const {
            roleName,
            receiverName,
            email,
            createdDate,
            sentDate,
            sortBy,
            orderBy,
            page,
            pageSize,
        } = req.query;

        const pageNumber = parseInt(page as string, 10) || 1;
        const limit = parseInt(pageSize as string, 10) || 10;
        const offset = (pageNumber - 1) * limit;

        let sortByModel: Order = [];

        if (sortBy && orderBy) {
            sortByModel = [[sortBy, orderBy]] as Order;
        }

        const whereClause: any = {};

        if (email) {
            whereClause.email = {
                [Op.substring]: `${email}`,
            };
        }
        if (createdDate) {
            whereClause.createdAt = {
                [Op.substring]: `${createdDate}`,
            };
        }
        if (sentDate) {
            whereClause.sentDate = {
                [Op.substring]: `${sentDate}`,
            };
        }

        const emailLog = await EmailLog.findAll({
            attributes: [
                'id',
                'email',
                'confirmationNumber',
                'createdAt',
                'sentDate',
                'isEmailSent',
                'sentTries',
                'action',
            ],
            include: [
                {
                    model: User,
                    as: 'receiver',
                    attributes: ['id', 'firstName', 'lastName'],
                    include: [
                        {
                            model: Role,
                            as: 'role',
                            attributes: ['Name'],
                            where: {
                                ...(roleName
                                    ? {
                                          Name: roleName,
                                      }
                                    : {}),
                            },
                        },
                    ],
                    where: {
                        ...(receiverName
                            ? {
                                  [Op.or]: [
                                      {
                                          firstName: {
                                              [Op.substring]: `${receiverName}`,
                                          },
                                      },
                                      {
                                          lastName: {
                                              [Op.substring]: `${receiverName}`,
                                          },
                                      },
                                  ],
                              }
                            : {}),
                    },
                },
            ],
            where: whereClause,
            order: sortByModel,
            limit,
            offset,
        });

        return res.status(httpCode.OK).json({
            status: httpCode.OK,
            message: messageConstant.EMAIL_LOG_RETRIEVED,
            data: emailLog,
        });
    } catch (error) {
        throw error;
    }
};

export const smsLog: Controller = async (req, res) => {
    try {
        const {
            roleName,
            receiverName,
            phoneNumber,
            createdDate,
            sentDate,
            sortBy,
            orderBy,
            page,
            pageSize,
        } = req.query;

        const pageNumber = parseInt(page as string, 10) || 1;
        const limit = parseInt(pageSize as string, 10) || 10;
        const offset = (pageNumber - 1) * limit;

        let sortByModel: Order = [];

        if (sortBy && orderBy) {
            sortByModel = [[sortBy, orderBy]] as Order;
        }

        const whereClause: any = {};

        if (phoneNumber) {
            whereClause.phoneNumber = {
                [Op.substring]: `${phoneNumber}`,
            };
        }
        if (createdDate) {
            whereClause.createdAt = {
                [Op.substring]: `${createdDate}`,
            };
        }
        if (sentDate) {
            whereClause.sentDate = {
                [Op.substring]: `${sentDate}`,
            };
        }

        const smsLog = await SMSLog.findAll({
            attributes: [
                'id',
                'phoneNumber',
                'confirmationNumber',
                'createdAt',
                'sentDate',
                'isSMSSent',
                'sentTries',
                'action',
            ],
            include: [
                {
                    model: User,
                    as: 'receiver',
                    attributes: ['id', 'firstName', 'lastName'],
                    include: [
                        {
                            model: Role,
                            as: 'role',
                            attributes: ['Name'],
                            where: {
                                ...(roleName
                                    ? {
                                          Name: roleName,
                                      }
                                    : {}),
                            },
                        },
                    ],
                    where: {
                        ...(receiverName
                            ? {
                                  [Op.or]: [
                                      {
                                          firstName: {
                                              [Op.substring]: `${receiverName}`,
                                          },
                                      },
                                      {
                                          lastName: {
                                              [Op.substring]: `${receiverName}`,
                                          },
                                      },
                                  ],
                              }
                            : {}),
                    },
                },
            ],
            where: whereClause,
            order: sortByModel,
            limit,
            offset,
        });

        return res.status(httpCode.OK).json({
            status: httpCode.OK,
            message: messageConstant.SMS_LOG_RETRIEVED,
            data: smsLog,
        });
    } catch (error) {
        throw error;
    }
};
