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
import sequelize, { Order, WhereOptions } from 'sequelize';
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
        // Extract query parameters from the request
        const { firstName, lastName, email, phone, page, pageSize } = req.query;

        // Calculate pagination parameters
        const pageNumber = parseInt(page as string, 10) || 1;
        const limit = parseInt(pageSize as string, 10) || 10;
        const offset = (pageNumber - 1) * limit;

        // Define the where clause based on query parameters
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

        // Retrieve patient history based on the where clause and pagination parameters
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

        // Return response with the retrieved patient history data
        return res.status(httpCode.OK).json({
            status: httpCode.OK,
            message: messageConstant.PATIENT_HISTORY_RETRIEVED,
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
        // Extract query parameters from the request
        const { name, email, phone, date, sortBy, orderBy, page, pageSize } =
            req.query;

        // Calculate pagination parameters
        const pageNumber = parseInt(page as string, 10) || 1;
        const limit = parseInt(pageSize as string, 10) || 10;
        const offset = (pageNumber - 1) * limit;

        // Define sorting order based on query parameters
        const order = sortBy && orderBy ? ([[sortBy, orderBy]] as Order) : [];

        // Define filters based on query parameters
        const nameFilter = name
            ? {
                  [Op.or]: [
                      { patientFirstName: { [Op.substring]: name } },
                      { patientLastName: { [Op.substring]: name } },
                  ],
              }
            : {};

        const emailFilter = email
            ? { patientEmail: { [Op.substring]: email } }
            : {};

        const phoneFilter = phone
            ? { patientPhoneNumber: { [Op.substring]: phone } }
            : {};

        const dateFilter = date ? { createdAt: { [Op.substring]: date } } : {};

        // Retrieve block requests based on filters and pagination parameters
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
            where: {
                requestStatus: RequestStatus.Blocked,
                ...nameFilter,
                ...emailFilter,
                ...phoneFilter,
                ...dateFilter,
            },
            include: [
                { model: User, as: 'user', attributes: ['id', 'status'] },
            ],
            order,
            limit,
            offset,
        });

        // Return response with block history data
        return res.status(httpCode.OK).json({
            status: httpCode.OK,
            message: messageConstant.BLOCK_HISTORY_RETRIEVED,
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
        // Extract user ID from request parameters
        const { id } = req.params;

        // Check if a record exists for the provided user ID
        const exists = await Request.findOne({ where: { userId: id } });
        if (!exists) {
            return res.status(httpCode.BAD_REQUEST).json({
                status: httpCode.BAD_REQUEST,
                message: messageConstant.INVALID_INPUT,
            });
        }

        // Extract sorting and pagination parameters from query
        const { sortBy, orderBy, page, pageSize } = req.query;

        // Calculate pagination parameters
        const pageNumber = parseInt(page as string, 10) || 1;
        const limit = parseInt(pageSize as string, 10) || 10;
        const offset = (pageNumber - 1) * limit;

        // Define sorting order based on query parameters
        const order = sortBy && orderBy ? ([[sortBy, orderBy]] as Order) : [];

        // Retrieve patient records associated with the user ID
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
                required: false,
            },
            where: { userId: id },
            order,
            limit,
            offset,
        });

        // Return response with patient records data
        return res.status(httpCode.OK).json({
            status: httpCode.OK,
            message: messageConstant.PATIENT_RECORD_RETRIEVED,
            data: { patients, id },
        });
    } catch (error) {
        throw error;
    }
};

export const searchRecord: Controller = async (req, res) => {
    try {
        // Destructuring query parameters
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

        // Pagination parameters
        const pageNumber = parseInt(page as string, 10) || 1;
        const limit = parseInt(pageSize as string, 10) || 10;
        const offset = (pageNumber - 1) * limit;

        // Sorting parameters
        const order = sortBy && orderBy ? ([[sortBy, orderBy]] as Order) : [];

        // Date range filter
        const dateRange =
            fromDate && toDate
                ? {
                      [Op.between]: [
                          new Date(fromDate as string),
                          new Date(toDate as string),
                      ],
                  }
                : {};

        // Filters for patient name and physician name
        const patientNameFilter = patientName
            ? {
                  [Op.or]: [
                      { patientFirstName: { [Op.substring]: patientName } },
                      { patientLastName: { [Op.substring]: patientName } },
                  ],
              }
            : {};

        const physicianNameFilter = physicianName
            ? {
                  [Op.or]: [
                      { firstName: { [Op.substring]: physicianName } },
                      { lastName: { [Op.substring]: physicianName } },
                  ],
              }
            : {};

        // Query to retrieve patient records with optional filters
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
                    ...physicianNameFilter,
                },
                required: false,
            },
            order,
            where: {
                ...dateRange,
                ...patientNameFilter,
                ...(requestStatus && {
                    requestStatus: { [Op.substring]: `${requestStatus}` },
                }),
                ...(requestType && {
                    requestType: { [Op.substring]: `${requestType}` },
                }),
                ...(email && { patientEmail: { [Op.substring]: `${email}` } }),
                ...(phoneNumber && {
                    patientPhoneNumber: { [Op.substring]: `${phoneNumber}` },
                }),
            },
            limit,
            offset,
            distinct: true,
        });

        // Return response with patient records data
        return res.status(httpCode.OK).json({
            status: httpCode.OK,
            message: messageConstant.RECORDS_RETRIEVED,
            data: patientData,
        });
    } catch (error) {
        throw error;
    }
};

export const unBlockPatient: Controller = async (req, res) => {
    try {
        // Extract record ID from request parameters
        const { id } = req.params;

        // Check if the record exists in the database
        const exists = await Request.findByPk(id);
        if (!exists) {
            return res.status(httpCode.BAD_REQUEST).json({
                status: httpCode.BAD_REQUEST,
                message: messageConstant.REQUEST_NOT_FOUND,
            });
        }

        // Update the request status and deletion flag to unblock the patient
        await Request.update(
            {
                requestStatus: RequestStatus.Unassigned,
                isDeleted: false,
            },
            { where: { id } },
        );

        // Return a success response after unblocking the patient
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
        // Extract record ID from request parameters
        const { id } = req.params;

        // Check if the record exists in the database
        const exists = await Request.findByPk(id);
        if (!exists) {
            return res.status(httpCode.BAD_REQUEST).json({
                status: httpCode.BAD_REQUEST,
                message: messageConstant.REQUEST_NOT_FOUND,
            });
        }

        // Delete the record from the database
        await Request.destroy({
            where: { id },
        });

        // Return a success response after deleting the record
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
        // Extract token from request headers
        const token = req.headers.authorization as string;

        // Fetch data from the specified endpoint
        const response = await fetch(
            'http://localhost:4000/admin/records/searchRecord',
            {
                headers: {
                    Authorization: token,
                },
            },
        );

        // Check if the response is successful
        if (!response.ok) {
            throw new Error(`Failed to fetch data: ${response.statusText}`);
        }

        // Parse response data as JSON
        const jsonData: any = await response.json();

        // Format the data for Excel export
        const formattedData = jsonData.data.rows.map((row: any) => {
            return {
                ...row,
                physicianId: row?.physician?.id,
                physicianFirstName: row?.physician?.firstName,
                physicianLastName: row?.physician?.lastName,
            };
        });

        // Convert formatted data to Excel file
        const xls = json2xls(formattedData);

        // Generate unique filename
        const filename = `records_patients_${Date.now()}.xlsx`;
        fs.writeFileSync(filename, xls, 'binary');

        // Download the Excel file
        return res.download(filename, filename, () => {
            // Delete the file after download completes
            fs.unlinkSync(filename);
        });
    } catch (error) {
        throw error;
    }
};

/**
 * @function emailLog
 * @param req - The request object from the client.
 * @param  res - The response object to send back the result.
 * @returns  A promise that resolves to the response object.
 * @description This function handles the retrieval of email logs based on various query parameters.
 */
export const emailLog: Controller = async (req, res) => {
    try {
        // Destructure and obtain query parameters from the request object
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

        // Parse the page number and pageSize, defaulting to 1 if not provided
        const pageNumber = parseInt(page as string, 10) || 1;
        const limit = parseInt(pageSize as string, 10) || 10;
        const offset = (pageNumber - 1) * limit;

        // Determine the sorting order if provided
        const order = sortBy && orderBy ? ([[sortBy, orderBy]] as Order) : [];

        // Create a where clause for email if it's provided
        const emailWhereClause = email
            ? { email: { [Op.substring]: email } }
            : {};

        // Create a where clause for created date if it's provided
        const createdDateWhereClause = createdDate
            ? { createdAt: { [Op.substring]: createdDate } }
            : {};

        // Create a where clause for sent date if it's provided
        const sentDateWhereClause = sentDate
            ? { sentDate: { [Op.substring]: sentDate } }
            : {};

        // Create a where clause for receiver name if it's provided
        const receiverWhereClause = receiverName
            ? {
                  [Op.or]: [
                      { firstName: { [Op.substring]: receiverName } },
                      { lastName: { [Op.substring]: receiverName } },
                  ],
              }
            : {};

        // Create a where clause for role name if it's provided
        const roleWhereClause = roleName ? { Name: roleName } : {};

        // Query the database for email logs with the constructed where clauses and pagination
        const emailLog = await EmailLog.findAndCountAll({
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
                            where: roleWhereClause,
                        },
                    ],
                    where: receiverWhereClause,
                },
            ],
            where: {
                ...emailWhereClause,
                ...createdDateWhereClause,
                ...sentDateWhereClause,
            },
            order,
            limit,
            offset,
        });

        // Return the response with the status code and the retrieved email logs
        return res.status(httpCode.OK).json({
            status: httpCode.OK,
            message: messageConstant.EMAIL_LOG_RETRIEVED,
            data: emailLog,
        });
    } catch (error) {
        throw error;
    }
};

/**
 * @function smsLog
 * @param req - The request object from the client.
 * @param  res - The response object to send back the result.
 * @returns  A promise that resolves to the response object.
 * @description This function handles the retrieval of sms logs based on various query parameters.
 */
export const smsLog: Controller = async (req, res) => {
    try {
        // Destructure and obtain query parameters from the request object
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

        // Parse the page number and pageSize, defaulting to 1 if not provided
        const pageNumber = parseInt(page as string, 10) || 1;
        const limit = parseInt(pageSize as string, 10) || 10;
        const offset = (pageNumber - 1) * limit;

        // Determine the sorting order if provided
        const order = sortBy && orderBy ? ([[sortBy, orderBy]] as Order) : [];

        // Create a where clause for phoneNumber if it's provided
        const phoneWhereClause = phoneNumber
            ? { email: { [Op.substring]: phoneNumber } }
            : {};

        // Create a where clause for created date if it's provided
        const createdDateWhereClause = createdDate
            ? { createdAt: { [Op.substring]: createdDate } }
            : {};

        // Create a where clause for sent date if it's provided
        const sentDateWhereClause = sentDate
            ? { sentDate: { [Op.substring]: sentDate } }
            : {};

        // Create a where clause for receiver name if it's provided
        const receiverWhereClause = receiverName
            ? {
                  [Op.or]: [
                      { firstName: { [Op.substring]: receiverName } },
                      { lastName: { [Op.substring]: receiverName } },
                  ],
              }
            : {};

        // Create a where clause for role name if it's provided
        const roleWhereClause = roleName ? { Name: roleName } : {};

        // Query the database for sms logs with the constructed where clauses and pagination
        const smsLog = await SMSLog.findAndCountAll({
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
                            where: roleWhereClause,
                        },
                    ],
                    where: receiverWhereClause,
                },
            ],
            where: {
                ...phoneWhereClause,
                ...createdDateWhereClause,
                ...sentDateWhereClause,
            },
            order,
            limit,
            offset,
        });

        // Return the response with the status code and the retrieved email logs
        return res.status(httpCode.OK).json({
            status: httpCode.OK,
            message: messageConstant.SMS_LOG_RETRIEVED,
            data: smsLog,
        });
    } catch (error) {
        throw error;
    }
};
