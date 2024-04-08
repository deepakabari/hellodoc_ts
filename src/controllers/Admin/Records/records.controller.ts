import { RequestStatus } from '../../../utils/enum.constant';
import httpCode from '../../../constants/http.constant';
import messageConstant from '../../../constants/message.constant';
import { Request, User } from '../../../db/models/index';
import { Controller } from '../../../interfaces';
import sequelize, { Order } from 'sequelize';
import dotenv from 'dotenv';
import { Op } from 'sequelize';
dotenv.config();

/**
 * Retrieves the history of patient requests from the database.
 * @param req - The Express Request object containing the incoming request data.
 * @param res - The Express Response object used to send back the desired HTTP response.
 * @returns - A promise that resolves to the Express Response object, which sends a JSON response containing the status code, success message, and the retrieved patients' history data.
 */
export const getPatientHistory: Controller = async (req, res) => {
    try {
        const { search } = req.query;
        const patientsHistory = await Request.findAll({
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
            where: {
                ...(search
                    ? {
                          [Op.or]: [
                              'patientFirstName',
                              'patientLastName',
                              'patientEmail',
                              'patientPhoneNumber',
                          ].map((field) => ({
                              [field]: {
                                  [Op.like]: `%${search}%`,
                              },
                          })),
                      }
                    : {}),
            },
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
        const { search } = req.query;

        const blockRequests = await Request.findAll({
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
                ...(search
                    ? {
                          [Op.or]: [
                              'patientFirstName',
                              'patientLastName',
                              'patientEmail',
                              'patientPhoneNumber',
                              'createdAt',
                          ].map((field) => ({
                              [field]: {
                                  [Op.like]: `%${search}%`,
                              },
                          })),
                      }
                    : {}),
            },
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
        const patients = await Request.findAll({
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
        const { search, sortBy, orderBy } = req.query;

        const patientData = await Request.findAll({
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
                where: { id: sequelize.col('Request.physicianId') },
            },
            order: [[sortBy, orderBy]] as Order,
            where: {
                ...(search
                    ? {
                          [Op.or]: [
                              'patientFirstName',
                              'patientLastName',
                              'patientEmail',
                              'patientPhoneNumber',
                          ].map((field) => ({
                              [field]: {
                                  [Op.like]: `%${search}%`,
                              },
                          })),
                      }
                    : {}),
            },
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
