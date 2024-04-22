import path, { resolve } from 'path';
import {
    AccountType,
    CaseTag,
    RequestStatus,
} from '../../../utils/enum.constant';
import httpCode from '../../../constants/http.constant';
import messageConstant from '../../../constants/message.constant';
import {
    EmailLog,
    Region,
    Request,
    RequestWiseFiles,
    SMSLog,
    User,
} from '../../../db/models/index';
import { Controller } from '../../../interfaces';
import transporter from '../../../utils/email';
import { FindAttributeOptions, Includeable, Order } from 'sequelize';
import { Op } from 'sequelize';
import { compileEmailTemplate } from '../../../utils/hbsCompiler';
import linkConstant from '../../../constants/link.constant';
import { sendSMS } from '../../../utils/smsSender';
import { sequelize } from '../../../db/config/db.connection';
import dotenv from 'dotenv';
dotenv.config();

/**
 * @function requestCount
 * @param req - Express request object.
 * @param res - Express response object used to send the response.
 * @returns - Returns a Promise that resolves to an Express response object. The response contains the status code, a success message, and the count of request data.
 * @throws - Throws an error if there's an issue in the execution of the function.
 * @description This function is an Express controller that retrieves count of request based caseTag
 */
export const requestCount: Controller = async (req, res) => {
    try {
        // Retrieve all possible values of CaseTag as an array
        const allCaseTags: CaseTag[] = Object.values(CaseTag);

        // Perform a database query to count requests grouped by caseTag
        const requestCounts = await Request.findAll({
            attributes: [
                'caseTag', // Attribute to group by
                [sequelize.fn('COUNT', sequelize.col('id')), 'count'], // Count the number of IDs for each caseTag
            ],
            where: {
                caseTag: {
                    [Op.in]: allCaseTags, // Filter to include only the caseTags present in allCaseTags array
                },
                requestStatus: {
                    [Op.in]: [
                        RequestStatus.Unassigned,
                        RequestStatus.Accepted,
                        RequestStatus.Conclude,
                        RequestStatus.Closed,
                        RequestStatus.CancelledByAdmin,
                        RequestStatus.Consult,
                        RequestStatus.UnPaid,
                        RequestStatus.MDOnRoute,
                        RequestStatus.MDOnSite,
                        RequestStatus.Declined,
                    ],
                },
            },
            group: 'caseTag', // Group the results by caseTag
            raw: true, // Return raw query results
        });

        // Initialize an object to map caseTags to their counts
        const countMap: any = {};

        // Populate countMap with counts for each caseTag
        requestCounts.forEach((row: any) => {
            countMap[row.caseTag] = row.count;
        });

        // Map allCaseTags to an array of objects containing caseTag and its count
        const result = allCaseTags.map((caseTag) => ({
            caseTag,
            count: countMap[caseTag] || 0, // Use the count from countMap or default to 0 if not present
        }));

        // Send a response with the status code 200 and the result in JSON format
        return res.status(httpCode.OK).json({
            status: httpCode.OK,
            message: messageConstant.SUCCESS,
            data: result,
        });
    } catch (error) {
        // In case of an error, throw the error to be handled by the error middleware
        throw error;
    }
};

/**
 * @function getPatientByState
 * @param req - Express request object, expects `state` in the query parameters.
 * @param res - Express response object used to send the response.
 * @returns - Returns a Promise that resolves to an Express response object. The response contains the status code, a success message, and the patient data.
 * @throws - Throws an error if there's an issue in the execution of the function.
 * @description This function is an Express controller that retrieves patients based on their state ('new', 'pending', 'active', 'conclude', 'to close', 'unPaid') and sends the patient data in the response. The patient data includes the patient's name, date of birth, requestor, date of service, phone number, address, and notes, etc...
 */
export const getPatientByState: Controller = async (req, res) => {
    try {
        // Extract variables from query parameters
        const {
            requestType,
            state,
            search,
            sortBy,
            orderBy,
            regions,
            page,
            pageSize,
        } = req.query;

        const pageNumber = parseInt(page as string, 10) || 1;
        const limit = parseInt(pageSize as string, 10) || 10;
        const offset = (pageNumber - 1) * limit;

        // Take needed attributes and modify accordingly
        let attributes = [
            'id',
            [
                sequelize.fn(
                    'CONCAT',
                    sequelize.col('patientFirstName'),
                    ' ',
                    sequelize.col('patientLastName'),
                ),
                'Name',
            ],
            ['dob', 'Date Of Birth'],
            [
                sequelize.fn(
                    'CONCAT',
                    sequelize.col('requestType'),
                    ' ',
                    sequelize.col('requestorFirstName'),
                    ' ',
                    sequelize.col('requestorLastName'),
                ),
                'Requestor',
            ],
            ['createdAt', 'Requested Date'],
            ['patientPhoneNumber', 'Phone'],
            'requestorPhoneNumber',
            [
                sequelize.fn(
                    'CONCAT',
                    sequelize.col('Request.street'),
                    ', ',
                    sequelize.col('Request.city'),
                    ', ',
                    sequelize.col('Request.state'),
                    ', ',
                    sequelize.col('Request.zipCode'),
                ),
                'Address',
            ],
            ['patientNote', 'Patient Note'],
            ['updatedAt', 'Date Of Service'],
            ['requestType', 'Requestor Type'],
            ['state', 'Region'],
            ['caseTag', 'State of Request'],
            ['transferNote', 'Transfer Note'],
        ];
        let condition;
        let includeModels = [
            {
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
                    id: sequelize.col('Request.physicianId'),
                },
                required: false,
            },
        ];
        let sortByModel;

        let requestTypeWhereClause = {};
        if (requestType && requestType !== 'All') {
            requestTypeWhereClause = { requestType: requestType as string };
        }

        switch (sortBy) {
            case 'id':
            case 'Requested Date':
            case 'Date Of Service':
                sortByModel = [[sortBy, orderBy]];
                break;
        }

        switch (state) {
            case 'new':
                condition = {
                    caseTag: CaseTag.New,
                    deletedAt: null,
                    requestStatus: RequestStatus.Unassigned,
                };
                break;
            case 'pending':
                condition = {
                    caseTag: CaseTag.Pending,
                    requestStatus: RequestStatus.Accepted,
                    deletedAt: null,
                };
                break;
            case 'active':
                condition = {
                    caseTag: CaseTag.Active,
                    isAgreementAccepted: true,
                    deletedAt: null,
                };
                break;
            case 'conclude':
                condition = {
                    caseTag: CaseTag.Conclude,
                    deletedAt: null,
                    requestStatus: RequestStatus.Consult,
                };
                break;
            case 'to close':
                condition = {
                    [Op.and]: [
                        { caseTag: CaseTag.Close },
                        {
                            [Op.or]: [
                                { physicianId: null },
                                { deletedAt: null },
                            ],
                        },
                        {
                            requestStatus: {
                                [Op.or]: [
                                    RequestStatus.CancelledByAdmin,
                                    RequestStatus.Conclude,
                                    RequestStatus.Declined,
                                ],
                            },
                        },
                    ],
                };
                break;
            case 'unpaid':
                condition = {
                    caseTag: CaseTag.UnPaid,
                    deletedAt: null,
                    requestStatus: RequestStatus.Closed,
                };
                break;
            default:
                return res.status(httpCode.INTERNAL_SERVER_ERROR).json({
                    status: httpCode.INTERNAL_SERVER_ERROR,
                    message: messageConstant.INTERNAL_SERVER_ERROR,
                });
        }

        // Select query to select attributes with respect to where condition and searching & ordering
        const patients = await Request.findAndCountAll({
            attributes: attributes as FindAttributeOptions,
            where: {
                ...condition,
                ...(search
                    ? {
                          [Op.or]: [
                              {
                                  patientFirstName: {
                                      [Op.like]: `%${search}%`,
                                  },
                              },
                              { patientLastName: { [Op.like]: `%${search}%` } },
                          ],
                      }
                    : {}),
                ...(regions ? { state: regions as string } : {}),
                ...requestTypeWhereClause,
            },
            include: includeModels as unknown as Includeable[],
            order: sortByModel as Order,
            limit,
            offset,
        });

        return res.json({
            status: httpCode.OK,
            message: messageConstant.REQUEST_RETRIEVED,
            data: { patients },
        });
    } catch (error) {
        throw error;
    }
};

/**
 * @function viewCase
 * @param req - Express request object, expects `id` in the parameters.
 * @param res - Express response object used to send the response.
 * @returns - Returns a Promise that resolves to an Express response object. The response contains the status code, a success message, and the case data.
 * @description This function is an Express controller that retrieves a case by its ID and sends the case data in the response. The case data includes the patient's name, date of birth, phone number, email, region, address, and room number.
 */
export const viewCase: Controller = async (req, res) => {
    try {
        // Extract id from request parameter
        const { id } = req.params;

        // select query to find attributes from Request table
        const viewCase = await Request.findAll({
            attributes: [
                'id',
                ['confirmationNumber', 'Confirmation Number'],
                ['patientNote', 'Patient Notes'],
                ['patientFirstName', 'First Name'],
                ['patientLastName', 'Last Name'],
                ['dob', 'Date Of Birth'],
                ['patientPhoneNumber', 'Phone Number'],
                ['patientEmail', 'Email'],
                ['state', 'Region'],
                [
                    sequelize.fn(
                        'CONCAT',
                        sequelize.col('street'),
                        ', ',
                        sequelize.col('city'),
                        ', ',
                        sequelize.col('state'),
                        ', ',
                        sequelize.col('zipCode'),
                    ),
                    'Address',
                ],
                ['roomNumber', 'Room'],
                ['caseTag', 'Case Tag'],
            ],
            where: { id },
        });

        if (!viewCase.length) {
            return res.status(httpCode.BAD_REQUEST).json({
                status: httpCode.BAD_REQUEST,
                message: messageConstant.DATA_NOT_FOUND,
            });
        }

        // success response with data in response body
        return res.json({
            status: httpCode.OK,
            message: messageConstant.CASE_RETRIEVED,
            data: viewCase,
        });
    } catch (error) {
        throw error;
    }
};

/**
 * @function viewNotes
 * @param req - Express request object, expects `id` in the parameters and `adminNotes` in the body.
 * @param res - Express response object used to send the response.
 * @returns - Returns a Promise that resolves to an Express response object. The response contains the status code, a success message, and the notes data along with the updated admin notes.
 * @description This function is an Express controller that retrieves the transfer and physician notes of a case by its ID, and sends the notes data.
 */
export const viewNotes: Controller = async (req, res) => {
    try {
        // Extract id from request parameter
        const { id } = req.params;

        // Select query to retrieve asked attributes from Request table
        const notes = await Request.findAll({
            attributes: [
                'id',
                ['transferNote', 'Transfer Notes'],
                ['physicianNotes', 'Physician Notes'],
                ['adminNotes', 'Admin Notes'],
                ['patientNote', 'Patient Note'],
            ],
            where: { id },
        });

        if (!notes.length) {
            return res.status(httpCode.BAD_REQUEST).json({
                status: httpCode.BAD_REQUEST,
                message: messageConstant.DATA_NOT_FOUND,
            });
        }

        return res.json({
            status: httpCode.OK,
            message: messageConstant.NOTE_RETRIEVED,
            data: notes,
        });
    } catch (error) {
        console.error(error);
        throw error;
    }
};

/**
 * @function updateNotes
 * @param req - Express request object, expects `id` in the parameters and `adminNotes` in the body.
 * @param res - Express response object used to send back the HTTP response.
 * @returns - Returns a Promise that resolves to an Express response object. The response contains the HTTP status code and a success message.
 * @description This controller function updates the `adminNotes` field for a specific request identified by `id`. It uses the `Request.update` method to apply the changes to the database. Upon successful update, it sends back a response with a status code and a success message.
 */
export const updateNotes: Controller = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        // Extract id from request parameter
        const { id } = req.params;

        // Take adminNotes from request body
        const { adminNotes } = req.body;

        // Check if request exists or not
        const exists = await Request.findByPk(id);
        if (!exists) {
            await transaction.rollback();
            return res.status(httpCode.BAD_REQUEST).json({
                status: httpCode.BAD_REQUEST,
                message: messageConstant.REQUEST_NOT_FOUND,
            });
        }

        // To update note in the adminNotes in request table
        await Request.update(
            {
                adminNotes,
            },
            { where: { id }, transaction },
        );

        await transaction.commit();

        return res.json({
            status: httpCode.OK,
            message: messageConstant.NOTE_UPDATED,
        });
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

/**
 * @function getPatientData
 * @param req - Express request object, expects `id` in the parameters.
 * @param res - Express response object used to send the response.
 * @returns - Returns a Promise that resolves to an Express response object. The response contains the status code, a success message, and the patient data.
 * @description This function is an Express controller that retrieve a case with patient name in response.
 */
export const getPatientData: Controller = async (req, res) => {
    try {
        // Extract id from request parameter
        const { id } = req.params;

        // Check if request exists or not
        const exists = await Request.findByPk(id);
        if (!exists) {
            return res.status(httpCode.BAD_REQUEST).json({
                status: httpCode.BAD_REQUEST,
                message: messageConstant.REQUEST_NOT_FOUND,
            });
        }

        // Select query to retrieve asked attributes from request table
        const patientName = await Request.findAll({
            attributes: [
                'id',
                'patientFirstName',
                'patientLastName',
                'patientEmail',
                'confirmationNumber',
                'requestType',
                'street',
                'city',
                'state',
                'zipCode',
                'dob',
                'patientPhoneNumber',
            ],
            where: { id },
        });

        if (!patientName.length) {
            return res.status(httpCode.BAD_REQUEST).json({
                status: httpCode.BAD_REQUEST,
                message: messageConstant.DATA_NOT_FOUND,
            });
        }

        // success response
        return res.status(httpCode.OK).json({
            status: httpCode.OK,
            message: messageConstant.SUCCESS,
            data: patientName,
        });
    } catch (error) {
        throw error;
    }
};

/**
 * @function cancelCase
 * @param req - Express request object, expects `id` in the parameters and `adminNotes` and `reasonForCancellation` in the body.
 * @param res - Express response object used to send the response.
 * @returns - Returns a Promise that resolves to an Express response object. The response contains the status code, a success message, and the updated case data.
 * @description This function is an Express controller that updates a case with the provided admin notes and cancellation reason, changes the status of the case to 'CancelledByAdmin', and sends the updated case data in the response.
 */
export const cancelCase: Controller = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        // Extract id from request parameter
        const { id } = req.params;

        // take value of these variables from request body
        const { adminNotes, reasonForCancellation } = req.body;

        // Check if request exists or not
        const exists = await Request.findByPk(id);
        if (
            !exists ||
            exists.requestStatus === RequestStatus.CancelledByAdmin
        ) {
            await transaction.rollback();
            return res.status(httpCode.BAD_REQUEST).json({
                status: httpCode.BAD_REQUEST,
                message: messageConstant.REQUEST_CANCELLED,
            });
        }

        // To update the requestStatus, adminNotes and caseTag to request table
        await Request.update(
            {
                adminNotes,
                reasonForCancellation,
                requestStatus: RequestStatus.CancelledByAdmin,
                caseTag: CaseTag.Close,
                isDeleted: true,
            },
            {
                where: {
                    id,
                },
                transaction,
            },
        );

        await transaction.commit();

        // success response
        return res.status(httpCode.OK).json({
            status: httpCode.OK,
            message: messageConstant.CASE_CANCELLED,
        });
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

/**
 * @function blockCase
 * @param req - Express request object, expects `id` in the parameters and `description` in the body.
 * @param res - Express response object used to send the response.
 * @returns - Returns a Promise that resolves to an Express response object. The response contains the status code, a success message, and the updated case data.
 * @description This function is an Express controller that updates a case with the provided description, changes the status of the case to 'Blocked'.
 */
export const blockCase: Controller = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        // Extract id from request parameter
        const { id } = req.params;

        // Take value of this from request body
        const { reasonForCancellation } = req.body;

        // Check if request exists or not
        const exists = await Request.findByPk(id);
        if (!exists || exists.requestStatus === RequestStatus.Blocked) {
            await transaction.rollback();
            return res.status(httpCode.BAD_REQUEST).json({
                status: httpCode.BAD_REQUEST,
                message: messageConstant.REQUEST_BLOCKED,
            });
        }

        // To update the reason and status to request table
        await Request.update(
            {
                reasonForCancellation,
                requestStatus: RequestStatus.Blocked,
                isDeleted: true,
            },
            { where: { id }, transaction },
        );

        await transaction.commit();

        // success response
        return res.status(httpCode.OK).json({
            status: httpCode.OK,
            message: messageConstant.CASE_BLOCKED,
        });
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

/**
 * @function clearCase
 * @param req - Express request object, expects `id` in the parameters.
 * @param res - Express response object used to send the response.
 * @returns - Returns a Promise that resolves to an Express response object. The response contains the status code, a success message, and the updated case data.
 * @description This function is an Express controller that updates the status of a case to 'Cleared'.
 */
export const clearCase: Controller = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { id } = req.params;

        // Check if request exists or not
        const exists = await Request.findByPk(id);
        if (!exists || exists.requestStatus === RequestStatus.Cleared) {
            await transaction.rollback();
            return res.status(httpCode.BAD_REQUEST).json({
                status: httpCode.BAD_REQUEST,
                message: messageConstant.REQUEST_CLEARED,
            });
        }

        // To update the requestStatus and soft deletion to request table
        await Request.update(
            {
                requestStatus: RequestStatus.Cleared,
                isDeleted: true,
                deletedAt: new Date(),
            },
            {
                where: { id },
                transaction,
            },
        );

        await transaction.commit();

        return res.status(httpCode.OK).json({
            status: httpCode.OK,
            message: messageConstant.CASE_CLEARED,
        });
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

/**
 * @function viewSendAgreement
 * @param req - The HTTP request object containing the request parameters.
 * @param res - The HTTP response object used for sending responses back to the client.
 * @returns - A promise that resolves to the HTTP response with the agreement details or an error message.
 * @description - Retrieves agreement details such as patient's phone number and email from the Request table based on the provided ID.
 */
export const viewSendAgreement: Controller = async (req, res) => {
    try {
        // Extract the request ID from the request parameters.
        const { id } = req.params;

        // Check if request exists or not
        const exists = await Request.findByPk(id);
        if (!exists) {
            return res.status(httpCode.BAD_REQUEST).json({
                status: httpCode.BAD_REQUEST,
                message: messageConstant.REQUEST_NOT_FOUND,
            });
        }

        // Retrieve the agreement details from the Request table.
        const viewSendAgreement = await Request.findAll({
            attributes: ['patientPhoneNumber', 'patientEmail'],
            where: { id },
        });

        // If agreement details are found, send a 200 OK response with the details.
        return res.status(httpCode.OK).json({
            status: httpCode.OK,
            message: messageConstant.SUCCESS,
            data: viewSendAgreement,
        });
    } catch (error) {
        throw error;
    }
};

/**
 * @function sendAgreement
 * @param req - Express request object, expects `id` in the parameters.
 * @param res - Express response object used to send the response.
 * @returns - Returns a Promise that resolves to an Express response object. The response contains the status code and a success message.
 * @description This function is an Express controller that retrieves a user by their ID, sends an agreement to the user's email and phone number, and sends a success response.
 */
export const sendAgreement: Controller = async (req, res) => {
    try {
        const { id } = req.params;

        // Attempt to retrieve the user's details from the Request table using the ID from the request parameters.
        const user = await Request.findOne({ where: { id } });

        // If no user is found, return a 400 Bad Request status with a user not exist message.
        if (!user) {
            return res.status(httpCode.BAD_REQUEST).json({
                status: httpCode.BAD_REQUEST,
                message: messageConstant.USER_NOT_EXIST,
            });
        }

        // Extract the patient's phone number and email from the retrieved user details.
        const phoneNumber = user.patientPhoneNumber;
        const email = user.patientEmail;

        // Prepare the data for the email template, including the agreement link and the recipient's name.
        const templateData = {
            agreementLink: linkConstant.AGREEMENT_URL,
            recipientName: user.patientFirstName,
        };

        // Compile the email template with the provided data.
        const data = await compileEmailTemplate(
            'sendAgreementEmail',
            templateData,
        );

        // Define the email options, including sender, recipient, subject, and HTML content.
        let mailOptions = {
            from: process.env.EMAIL_FROM,
            to: email,
            subject: linkConstant.agreementSubject,
            html: data,
        };

        new Promise((resolve, reject) => {
            transporter.sendMail(mailOptions, (error: Error, info: string) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(info);
                }
            });
        })
            .then(() => {
                // Update the Request table asynchronously
                Request.update({ isAgreementSent: true }, { where: { id } });

                // Send SMS asynchronously
                const messageBody = `Hello ${user.patientFirstName}, \n\n Please review and sign the agreement by following the link below: ${linkConstant.AGREEMENT_URL}`;
                sendSMS(messageBody);

                EmailLog.create({
                    email,
                    confirmationNumber: user.confirmationNumber,
                    senderId: req.user.id,
                    receiverId: user.id,
                    sentDate: new Date(),
                    isEmailSent: true,
                    sentTries: 1,
                    action: 'Send Agreement',
                });

                SMSLog.create({
                    phoneNumber,
                    confirmationNumber: user.confirmationNumber,
                    senderId: req.user.id,
                    receiverId: user.id,
                    sentDate: new Date(),
                    isSMSSent: true,
                    sentTries: 1,
                    action: 'Send Agreement',
                });
            })
            .catch((error: Error) => {
                console.error('Error sending email:', error);
                // Handle the email sending failure, e.g., by logging or retrying
            });

        // Respond immediately to the client with a success message
        return res.json({
            status: httpCode.OK,
            message: messageConstant.AGREEMENT_EMAIL_SENT,
        });
    } catch (error) {
        throw error;
    }
};

/**
 * @function getRegions
 * @param req - Express request object.
 * @param res - Express response object used to send the response.
 * @returns - Returns a Promise that resolves to an Express response object. The response contains the status code, a success message, and the regions data.
 * @description This function is an Express controller that retrieves all regions and sends the regions data in the response.
 */
export const getRegions: Controller = async (req, res) => {
    try {
        // Fetch all regions from the database
        const getRegions = await Region.findAll({
            attributes: ['id', 'name'],
        });

        // Check if regions were found
        if (!getRegions.length) {
            return res.status(httpCode.BAD_REQUEST).json({
                status: httpCode.BAD_REQUEST,
                message: messageConstant.DATA_NOT_FOUND,
            });
        }

        // Return regions data in JSON response
        return res.status(httpCode.OK).json({
            status: httpCode.OK,
            message: messageConstant.SUCCESS,
            data: getRegions,
        });
    } catch (error) {
        throw error;
    }
};

/**
 * @function getPhysicianByRegion
 * @param req - Express request object, expects `id` in the parameters.
 * @param res - Express response object used to send the response.
 * @returns - Returns a Promise that resolves to an Express response object. The response contains the status code, a success message, and the physicians data.
 * @description This function is an Express controller that retrieves all physicians in a specific region and sends the physicians data in the response.
 */
export const getPhysicianByRegion: Controller = async (req, res) => {
    try {
        // Extract region ID from request parameters
        const { id } = req.params;

        // Fetch physicians associated with the specified region
        const getPhysicianByRegion = await User.findAll({
            where: {
                accountType: AccountType.Physician,
            },
            include: [
                {
                    model: Region,
                    as: 'regions',
                    where: { id },
                    through: {
                        attributes: [],
                    },
                    attributes: [],
                },
            ],
            attributes: ['id', 'firstName', 'lastName'],
        });

        // Check if physicians were found
        if (!getPhysicianByRegion.length) {
            return res.status(httpCode.BAD_REQUEST).json({
                status: httpCode.BAD_REQUEST,
                message: messageConstant.DATA_NOT_FOUND,
            });
        }

        // Return physicians data in JSON response
        return res.status(httpCode.OK).json({
            status: httpCode.OK,
            message: messageConstant.SUCCESS,
            data: getPhysicianByRegion,
        });
    } catch (error) {
        throw error;
    }
};

/**
 * @function assignCase
 * @param req - Express request object, expects `transferNote` in the body.
 * @param res - Express response object used to send the response.
 * @returns - Returns a Promise that resolves to an Express response object. The response contains the status code and a success message.
 * @description This function is an Express controller that assigns a case based on the provided physicianId, admin note and update physicianId and adminNotes and caseTag: Pending.
 */
export const assignCase: Controller = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        // Extract request parameters and body data
        const { id } = req.params;
        const { physicianId, transferNote } = req.body;

        // Check if request exists or not
        const exists = await Request.findByPk(id);
        if (!exists) {
            await transaction.rollback();
            // If request doesn't exist, return bad request response
            return res.status(httpCode.BAD_REQUEST).json({
                status: httpCode.BAD_REQUEST,
                message: messageConstant.REQUEST_NOT_FOUND,
            });
        }

        // Update request with assigned physician ID and transfer note
        await Request.update(
            {
                physicianId,
                transferNote,
            },
            { where: { id }, transaction },
        );

        await transaction.commit();

        // Return success response
        return res.status(httpCode.OK).json({
            status: httpCode.OK,
            message: messageConstant.CASE_ASSIGNED,
        });
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

/**
 * @function viewUploads
 * @param req - Express request object, expects `id` in the parameters.
 * @param res - Express response object used to send the response.
 * @returns - Returns a Promise that resolves to an Express response object. The response contains the status code, a success message, and the uploads data with formatted dates.
 * @description This function is an Express controller that retrieves all uploads for a specific request, formats the upload dates, and sends the uploads data in the response.
 */
export const viewUploads: Controller = async (req, res) => {
    try {
        // Extract request parameters and query parameters
        const { id } = req.params;
        const { sortBy, orderBy } = req.query;

        // Check if request exists or not
        const exists = await Request.findByPk(id);
        if (!exists) {
            return res.status(httpCode.BAD_REQUEST).json({
                status: httpCode.BAD_REQUEST,
                message: messageConstant.REQUEST_NOT_FOUND,
            });
        }

        // Construct sorting criteria based on sortBy and orderBy parameters
        let sortByModel;
        switch (sortBy) {
            case 'id':
            case 'createdAt':
                sortByModel = [[sortBy, orderBy]];
                break;
        }

        // Fetch uploads associated with the request
        const uploads = await RequestWiseFiles.findAll({
            where: { requestId: id },
            attributes: ['id', 'fileName', 'createdAt', 'documentPath'],
            order: sortByModel as Order,
        });

        // Return uploads data in JSON response
        return res.status(httpCode.OK).json({
            status: httpCode.OK,
            message: messageConstant.FILE_RETRIEVED,
            data: uploads,
        });
    } catch (error) {
        throw error;
    }
};

/**
 * @function sendFileThroughMail
 * @param req - Express request object, expects `email and array of files` in the body.
 * @param res - Express response object used to send the response.
 * @returns - Returns a Promise that resolves to an Express response object. The response contains the status code, a success message.
 * @description This function is an Express controller that sends selected files to patient's email address.
 */
export const sendFileThroughMail: Controller = async (req, res) => {
    try {
        // Extract email and files from request body
        const { email, files } = req.body;

        // Validate fileNames array
        if (!Array.isArray(files) || !files.length) {
            return res
                .status(httpCode.BAD_REQUEST)
                .json({ message: messageConstant.NO_FILE_SELECTED });
        }

        // Check if user with the provided email exists
        const user = await Request.findOne({ where: { patientEmail: email } });
        if (!user) {
            return res.status(httpCode.BAD_REQUEST).json({
                status: httpCode.OK,
                message: messageConstant.REQUEST_NOT_FOUND,
            });
        }

        const filePath = path.join(
            __dirname,
            '..',
            '..',
            '..',
            'public',
            'images',
        );

        // Construct email message
        const mailOptions = {
            from: process.env.EMAIL_FROM,
            to: email,
            subject: 'Medical Files Attached',
            text: 'Here is your Medical Report, Prescription file, Medical Tests files.',
            attachments: files.map((file: string) => ({
                filename: file,
                path: `${filePath}/${file}`,
            })),
        };

        new Promise((resolve, reject) => {
            transporter.sendMail(mailOptions, (error: Error, info: string) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(info);
                }
            });
        })
            .then(() => {
                EmailLog.create({
                    email,
                    confirmationNumber: user.confirmationNumber,
                    senderId: req.user.id,
                    receiverId: user.id,
                    sentDate: new Date(),
                    isEmailSent: true,
                    sentTries: 1,
                    action: 'Request Medical Files',
                });
            })
            .catch((error: Error) => {
                console.error('Error Sending mail:', error);
            });

        return res.status(httpCode.OK).json({
            status: httpCode.OK,
            message: messageConstant.EMAIL_SENT,
        });
    } catch (error) {
        throw error;
    }
};

/**
 * @function uploadFile
 * @param req - Express request object, expects `id` in the parameters.
 * @param res - Express response object used to send the response.
 * @returns - Returns a Promise that resolves to an Express response object. The response contains the status code, a success message, and the uploads data.
 * @description This function is an Express controller that uploads the file in requestWiseFiles table.
 */
export const uploadFile: Controller = async (req, res) => {
    try {
        // Extract request id from request parameters
        const id = +req.params.id;

        // Check if request exists or not
        const exists = await Request.findByPk(id);
        if (!exists) {
            return res.status(httpCode.BAD_REQUEST).json({
                status: httpCode.BAD_REQUEST,
                message: messageConstant.REQUEST_NOT_FOUND,
            });
        }

        // Check if file was uploaded
        if (!req.file) {
            return res.status(httpCode.BAD_REQUEST).json({
                status: httpCode.BAD_REQUEST,
                message: messageConstant.FILE_NOT_UPLOADED,
            });
        }

        // Rename file if a file with the same name already exists
        let newFileName = req.file.originalname;

        const existingFile = await RequestWiseFiles.findOne({
            where: { fileName: newFileName, requestId: id },
        });

        if (existingFile) {
            let counter = 1;
            let filenameParts = newFileName.split('.');
            const extension = filenameParts.pop();
            const baseFilename = filenameParts.join('.');

            while (
                await RequestWiseFiles.findOne({
                    where: { fileName: newFileName },
                })
            ) {
                newFileName = `${baseFilename} (${counter}).${extension}`;
                counter++;
            }
        }

        // Create record for uploaded file
        const uploadFile = await RequestWiseFiles.create({
            requestId: id,
            userId: exists.userId,
            fileName: newFileName,
            documentPath: req.file.path,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        // Check if file was successfully uploaded
        if (!uploadFile) {
            return res.status(httpCode.BAD_REQUEST).json({
                status: httpCode.BAD_REQUEST,
                message: messageConstant.ERROR_UPLOAD_FILE,
            });
        }

        // Return success response
        return res.status(httpCode.OK).json({
            status: httpCode.OK,
            message: messageConstant.FILE_UPLOADED,
            data: uploadFile,
        });
    } catch (error) {
        throw error;
    }
};

/**
 * @function closeCaseView
 * @param req - Express request object, expects `id` in the parameters.
 * @param res - Express response object used to send the response.
 * @returns - Returns a Promise that resolves to an Express response object. The response contains the status code, a success message, and the case data.
 * @description This function is an Express controller that retrieves a case by its ID and sends the case data in the response.
 */
export const closeCaseView: Controller = async (req, res) => {
    try {
        // Extract request id and query parameters
        const { id } = req.params;
        const { sortBy, orderBy } = req.query;

        // Check if request exists or not
        const exists = await Request.findByPk(id);
        if (!exists) {
            return res.status(httpCode.BAD_REQUEST).json({
                status: httpCode.BAD_REQUEST,
                message: messageConstant.REQUEST_NOT_FOUND,
            });
        }

        let sortByModel;
        switch (sortBy) {
            // Construct sorting criteria based on sortBy and orderBy parameters
            case 'id':
            case 'createdAt':
                sortByModel = [
                    [
                        { model: RequestWiseFiles, as: 'requestWiseFiles' },
                        sortBy,
                        orderBy,
                    ],
                ];
                break;
        }

        // Fetch case details and associated files
        const closeCase = await Request.findAll({
            attributes: [
                'id',
                'patientFirstName',
                'patientLastName',
                'confirmationNumber',
                'patientFirstName',
                'patientLastName',
                'dob',
                'patientPhoneNumber',
                'patientEmail',
            ],
            include: [
                {
                    model: RequestWiseFiles,
                    attributes: ['fileName', 'documentPath', 'createdAt'],
                },
            ],
            where: { id },
            order: sortByModel as Order,
        });

        // Check if case details were found
        if (!closeCase.length) {
            return res.status(httpCode.BAD_REQUEST).json({
                status: httpCode.BAD_REQUEST,
                message: messageConstant.DATA_NOT_FOUND,
            });
        }

        // Return case details and associated files
        return res.status(httpCode.OK).json({
            status: httpCode.OK,
            message: messageConstant.SUCCESS,
            data: closeCase,
        });
    } catch (error) {
        throw error;
    }
};

/**
 * @function updateCloseCase
 * @param req - Express request object, expects `id` in the parameters and `patientPhoneNumber`, `patientEmail` in body.
 * @param res - Express response object used to send the response.
 * @returns - Returns a Promise that resolves to an Express response object. The response contains the status code, a success .
 * @description This function is an Express controller that updates the close case.
 */
export const updateCloseCase: Controller = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        // Extract the request id from request parameters.
        const { id } = req.params;

        // Extract updated patient phone number and email from request body
        const { patientPhoneNumber, patientEmail } = req.body;

        // Check if request exists or not
        const exists = await Request.findByPk(id);
        if (!exists) {
            await transaction.rollback();
            return res.status(httpCode.BAD_REQUEST).json({
                status: httpCode.BAD_REQUEST,
                message: messageConstant.REQUEST_NOT_FOUND,
            });
        }

        // Update patient phone number and email
        await Request.update(
            {
                patientPhoneNumber,
                patientEmail,
            },
            { where: { id }, transaction },
        );

        await transaction.commit();

        return res.status(httpCode.OK).json({
            status: httpCode.OK,
            message: messageConstant.CLOSE_CASE_UPDATED,
        });
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

/**
 * @function closeCase
 * @param req - Express request object. Expects a parameter `id` representing the case ID.
 * @param res - Express response object used to send back the HTTP response.
 * @returns - Returns a Promise that resolves to an Express response object. The response contains the HTTP status code and a success message.
 * @description This controller function updates the status of a case to 'Closed' and its case tag to 'UnPaid'. It is triggered when a case with the tag 'Close' needs to be updated to reflect its closure. The function responds with a success message upon successful update.
 */
export const closeCase: Controller = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { id } = req.params;

        // Check if request exists or not
        const exists = await Request.findByPk(id);
        if (!exists) {
            await transaction.rollback();
            return res.status(httpCode.BAD_REQUEST).json({
                status: httpCode.BAD_REQUEST,
                message: messageConstant.REQUEST_NOT_FOUND,
            });
        }

        await Request.update(
            {
                requestStatus: RequestStatus.Closed,
                caseTag: CaseTag.UnPaid,
                concludedDate: new Date(),
            },
            { where: { id, caseTag: CaseTag.Close }, transaction },
        );

        await transaction.commit();

        return res.status(httpCode.OK).json({
            status: httpCode.OK,
            message: messageConstant.CASE_CLOSED,
        });
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

/**
 * @function requestSupport
 * @param req - Express request object.
 * @param res - Express response object used to send the response.
 * @returns - Returns a Promise that resolves to an Express response object. The response contains the status code and a success message.
 * @description This function is an Express controller that retrieves all unscheduled physicians, sends a message to each of them, and sends a success response.
 */
export const requestSupport: Controller = async (req, res) => {
    try {
        // Extract message from request body
        const { message } = req.body;

        // Find all unscheduled physicians
        const unScheduledPhysician = await User.findAll({
            where: { accountType: 'Physician', onCallStatus: 'UnScheduled' },
        });

        // Loop through each unscheduled physician
        for (const physician of unScheduledPhysician) {
            // Prepare template data
            const templateData = {
                physicianName: physician.firstName + ' ' + physician.lastName,
                message: message,
            };

            // Compile email template with template data
            const data = await compileEmailTemplate(
                'requestSupport',
                templateData,
            );

            // Construct email options
            const mailOptions = {
                from: process.env.EMAIL_FROM,
                to: physician.email,
                subject:
                    'Immediate On-Call Support Required - Your Assistance Needed',
                html: data,
            };

            new Promise((resolve, reject) => {
                transporter.sendMail(
                    mailOptions,
                    (error: Error, info: string) => {
                        if (error) {
                            reject(error);
                        } else {
                            resolve(info);
                        }
                    },
                );
            })
                .then(() => {
                    EmailLog.create({
                        email: physician.email,
                        senderId: req.user.id,
                        receiverId: physician.id,
                        sentDate: new Date(),
                        isEmailSent: true,
                        sentTries: 1,
                        action: 'Request Support',
                    });
                })
                .catch((error: Error) => {
                    console.error('Error sending mail:', error);
                });
        }

        // Return success response
        return res.status(httpCode.OK).json({
            status: httpCode.OK,
            message: messageConstant.MESSAGE_SENT_SUCCESSFULLY,
        });
    } catch (error) {
        throw new Error(messageConstant.ERROR_SEND_MESSAGE);
    }
};

/**
 * @function transferRequest
 * @param req - Express request object, expects `physicianId` and `transferNote` in the body, and `id` in the parameters.
 * @param res - Express response object used to send the response.
 * @returns - Returns a Promise that resolves to an Express response object. The response contains the status code and a success message if the request is successfully updated. If the request is not updated, it returns an error message.
 * @description This function is an Express controller that handles request transfer. It updates the `physicianId` and `transferNote` of a request with the given `id` and sends a success response.
 */
export const transferRequest: Controller = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        // Extract Request id from request parameters.
        const { id } = req.params;
        const { physicianId, transferNote } = req.body;

        // Check if request exists or not
        const exists = await Request.findByPk(id);
        if (!exists) {
            await transaction.rollback();
            return res.status(httpCode.BAD_REQUEST).json({
                status: httpCode.BAD_REQUEST,
                message: messageConstant.REQUEST_NOT_FOUND,
            });
        }

        await Request.update(
            { physicianId, transferNote },
            { where: { id }, transaction },
        );

        await transaction.commit();

        return res.status(httpCode.OK).json({
            status: httpCode.OK,
            message: messageConstant.REQUEST_TRANSFERRED,
        });
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

/**
 * Sends an email to a patient with a link to create a request on the HalloDoc platform.
 * @param req - The Express Request object containing the incoming request data, including the patient's first name, last name, phone number, and email.
 * @param res - The Express Response object used to send back the desired HTTP response.
 * @returns - A promise that resolves to the Express Response object, which sends a JSON response containing the status code and message indicating the result of the email sending operation.
 */
export const sendPatientRequest: Controller = async (req, res) => {
    try {
        // Extract patient information from request body
        const { firstName, lastName, phoneNumber, email } = req.body;

        // Prepare template data for email
        const templateData = {
            createRequestLink: linkConstant.REQUEST_URL,
            patientName: firstName + ' ' + lastName,
        };

        // Compile email template with template data
        const data = await compileEmailTemplate(
            'sendRequestEmail',
            templateData,
        );

        // Send SMS to patient
        const messageBody = `Hello ${firstName}, To Create a Request on our secure online portal. Please click on the button below to create Your First Request: ${linkConstant.REQUEST_URL}.`;
        sendSMS(messageBody);

        // Log SMS sending
        await SMSLog.create({
            phoneNumber,
            senderId: req.user.id,
            sentDate: new Date(),
            isSMSSent: true,
            sentTries: 1,
            action: 'Send request link to patient',
        });

        // Construct email options
        const mailOptions = {
            from: process.env.EMAIL_FROM,
            to: email,
            subject: linkConstant.createRequestSubject,
            html: data,
        };

        new Promise((resolve, reject) => {
            transporter.sendMail(mailOptions, (error: Error, info: string) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(info);
                }
            });
        }).then(() => {
            EmailLog.create({
                email,
                senderId: req.user.id,
                sentDate: new Date(),
                isEmailSent: true,
                sentTries: 1,
                action: 'Send request link to patient',
            });
        });

        // Return success response
        return res.json({
            status: httpCode.OK,
            message: messageConstant.REQUEST_EMAIL_SMS_SENT,
        });
    } catch (error) {
        throw error;
    }
};
