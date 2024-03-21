import {
    AccountType,
    CaseTag,
    RequestStatus,
} from '../../../utils/enum.constant';
import httpCode from '../../../constants/http.constant';
import messageConstant from '../../../constants/message.constant';
import {
    Region,
    Request,
    RequestWiseFiles,
    User,
} from '../../../db/models/index';
import { Controller } from '../../../interfaces';
import transporter from '../../../utils/email';
import sequelize, { FindAttributeOptions, Includeable, Order } from 'sequelize';
import { Op } from 'sequelize';
import dotenv from 'dotenv';
import { compileEmailTemplate } from '../../../utils/hbsCompiler';
import linkConstant from '../../../constants/link.constant';
import { sendSMS } from '../../../utils/smsSender';
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
        const requestCounts = await Request.count({
            attributes: [
                'caseTag',
                [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
            ],
            group: 'caseTag',
        });

        return res.status(httpCode.OK).json({
            status: httpCode.OK,
            message: messageConstant.SUCCESS,
            data: requestCounts,
        });
    } catch (error) {
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
        const { state, search, sortBy, orderBy, regions } = req.query;

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
        let includeModels;
        let sortByModel;

        switch (sortBy) {
            case 'id':
            case 'Requested Date':
            case 'Date Of Service':
                sortByModel = [[sortBy, orderBy]];
                break;
        }

        switch (state) {
            case 'new':
                condition = { caseTag: 'New', deletedAt: null };
                break;
            case 'pending':
                condition = { caseTag: 'Pending', deletedAt: null };
                includeModels = [
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
                    },
                ];
                break;
            case 'active':
                condition = {
                    caseTag: 'Active',
                    isAgreementAccepted: true,
                    deletedAt: null,
                };
                includeModels = [
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
                    },
                ];
                break;
            case 'conclude':
                condition = { caseTag: 'Conclude', deletedAt: null };
                includeModels = [
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
                    },
                ];
                break;
            case 'to close':
                condition = {
                    [Op.and]: [
                        { caseTag: 'To Close' },
                        {
                            [Op.or]: [
                                { physicianId: null },
                                { deletedAt: null },
                            ],
                        },
                    ],
                };
                includeModels = [
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
                    },
                ];
                break;
            case 'unpaid':
                condition = { caseTag: 'UnPaid', deletedAt: null };
                includeModels = [
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
                    },
                ];
                break;
            default:
                return res.status(httpCode.INTERNAL_SERVER_ERROR).json({
                    status: httpCode.INTERNAL_SERVER_ERROR,
                    message: messageConstant.INTERNAL_SERVER_ERROR,
                });
        }

        // Select query to select attributes with respect to where condition and searching & ordering
        const patients = await Request.findAll({
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
            },
            include: includeModels as unknown as Includeable[],
            order: sortByModel as Order,
        });

        return res.json({
            status: httpCode.OK,
            message: messageConstant.SUCCESS,
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

        if (!viewCase) {
            return res.status(httpCode.NOT_FOUND).json({
                status: httpCode.NOT_FOUND,
                message: messageConstant.DATA_NOT_FOUND,
            });
        }

        // success response with data in response body
        return res.json({
            status: httpCode.OK,
            message: messageConstant.SUCCESS,
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

        if (!notes) {
            return res.status(httpCode.NOT_FOUND).json({
                status: httpCode.NOT_FOUND,
                message: messageConstant.DATA_NOT_FOUND,
            });
        }

        return res.json({
            status: httpCode.OK,
            message: messageConstant.SUCCESS,
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
    try {
        // Extract id from request parameter
        const { id } = req.params;

        // Take adminNotes from request body
        const { adminNotes } = req.body;

        // To update note in the adminNotes in request table
        await Request.update(
            {
                adminNotes,
            },
            { where: { id } },
        );

        return res.json({
            status: httpCode.OK,
            message: messageConstant.SUCCESS,
        });
    } catch (error) {
        throw error;
    }
};

/**
 * @function getPatientName
 * @param req - Express request object, expects `id` in the parameters.
 * @param res - Express response object used to send the response.
 * @returns - Returns a Promise that resolves to an Express response object. The response contains the status code, a success message, and the patient data.
 * @description This function is an Express controller that retrieve a case with patient name in response.
 */
export const getPatientName: Controller = async (req, res) => {
    try {
        // Extract id from request parameter
        const { id } = req.params;

        // Select query to retrieve asked attributes from request table
        const patientName = await Request.findAll({
            attributes: [
                'id',
                'patientFirstName',
                'patientLastName',
                'confirmationNumber',
                'requestType',
            ],
            where: { id },
        });

        if (!patientName) {
            return res.status(httpCode.NOT_FOUND).json({
                status: httpCode.NOT_FOUND,
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
    try {
        // Extract id from request parameter
        const { id } = req.params;

        // take value of these variables from request body
        const { adminNotes, reasonForCancellation } = req.body;

        // To update the requestStatus, adminNotes and caseTag to request table
        await Request.update(
            {
                adminNotes,
                reasonForCancellation,
                requestStatus: RequestStatus.CancelledByAdmin,
                caseTag: CaseTag.Close,
                isDeleted: true,
                physicianId: 17,
            },
            {
                where: {
                    id,
                },
            },
        );

        // success response
        return res.status(httpCode.OK).json({
            status: httpCode.OK,
            message: messageConstant.SUCCESS,
        });
    } catch (error) {
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
    try {
        // Extract id from request parameter
        const { id } = req.params;

        // Take value of this from request body
        const { reasonForCancellation } = req.body;

        // To update the reason and status to request table
        await Request.update(
            {
                reasonForCancellation,
                requestStatus: RequestStatus.Blocked,
                deletedAt: new Date(),
            },
            { where: { id } },
        );

        // success response
        return res.status(httpCode.OK).json({
            status: httpCode.OK,
            message: messageConstant.SUCCESS,
        });
    } catch (error) {
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
    try {
        // To update the requestStatus and soft deletion to request table
        await Request.update(
            {
                requestStatus: RequestStatus.Cleared,
                isDeleted: true,
                deletedAt: new Date(),
            },
            {
                where: { id: req.params.id },
            },
        );

        return res.status(httpCode.OK).json({
            status: httpCode.OK,
            message: messageConstant.SUCCESS,
        });
    } catch (error) {
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
        // Extract the ID from the request parameters.
        const { id } = req.params;

        // Retrieve the agreement details from the Request table.
        const viewSendAgreement = await Request.findAll({
            attributes: ['patientPhoneNumber', 'patientEmail'],
            where: {
                id,
            },
        });

        // If no agreement details are found, send a 502 Bad Gateway response with an appropriate message.
        if (!viewSendAgreement) {
            return res.status(httpCode.BAD_REQUEST).json({
                status: httpCode.BAD_GATEWAY,
                message: messageConstant.DATA_NOT_FOUND,
            });
        }

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
        // Attempt to retrieve the user's details from the Request table using the ID from the request parameters.
        const user = await Request.findOne({ where: { id: req.params.id } });

        // If no user is found, return a 404 Not Found status with a user not exist message.
        if (!user) {
            return res.status(httpCode.NOT_FOUND).json({
                status: httpCode.NOT_FOUND,
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

        // Send the email and handle the callback for success or failure.
        return transporter.sendMail(mailOptions, async (error: Error) => {
            if (error) {
                throw error;
            } else {
                console.log('Agreement email Sent Successfully');

                // Update the Request table to reflect that the agreement has been sent.
                await Request.update(
                    { isAgreementSent: true },
                    { where: { id: req.params.id } },
                );

                // Prepare the SMS message body with a link to the agreement.
                const messageBody = `Hello ${user.patientFirstName}, \n\n Please review and sign the agreement by following the link below: http://localhost:3000/agreement.`;
                sendSMS(messageBody);

                // Return a 200 OK status with a message indicating the email was sent successfully.
                return res.json({
                    status: httpCode.OK,
                    message: messageConstant.AGREEMENT_EMAIL_SENT,
                });
            }
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
        const getRegions = await Region.findAll({
            attributes: ['id', 'name'],
        });

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
        const { id } = req.params;
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
    try {
        const { physicianId, transferNote } = req.body;
        const { id } = req.params;

        await Request.update(
            {
                physicianId,
                transferNote,
                caseTag: CaseTag.Pending,
                requestStatus: RequestStatus.Processing,
            },
            { where: { id } },
        );

        return res.status(httpCode.OK).json({
            status: httpCode.OK,
            message: messageConstant.SUCCESS,
        });
    } catch (error) {
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
        const { id } = req.params;
        const { sortBy, orderBy } = req.query;

        let sortByModel;
        switch (sortBy) {
            case 'id':
            case 'createdAt':
                sortByModel = [[sortBy, orderBy]];
                break;
        }

        const uploads = await RequestWiseFiles.findAll({
            where: { requestId: id },
            attributes: ['id', 'fileName', 'createdAt', 'documentPath'],
            order: sortByModel as Order,
        });

        if (!uploads) {
            return res.status(httpCode.NOT_FOUND).json({
                status: httpCode.NOT_FOUND,
                message: messageConstant.FILE_NOT_FOUND,
            });
        }

        // To format the date in MM(string) DD YYYY format
        // const formattedUploads = uploads.map((upload) => {
        //     const date = new Date(upload.createdAt);
        //     const formattedDate = date.toLocaleDateString("en-US", {
        //         year: "numeric",
        //         month: "short",
        //         day: "numeric",
        //     });
        //     const { createdAt, ...uploadWithoutCreatedAt } = upload.toJSON();
        //     return {
        //         ...uploadWithoutCreatedAt,
        //         "Upload Date": formattedDate,
        //     };
        // });

        return res.status(httpCode.OK).json({
            status: httpCode.OK,
            message: messageConstant.SUCCESS,
            data: uploads,
        });
    } catch (error) {
        throw error;
    }
};

export const uploadFile: Controller = async (req, res) => {
    try {
        const id = +req.params.id;

        if (!req.file) {
            return res.status(httpCode.BAD_REQUEST).json({
                status: httpCode.BAD_REQUEST,
                message: messageConstant.FILE_NOT_UPLOADED,
            });
        }

        const uploadFile = await RequestWiseFiles.create({
            requestId: id,
            fileName: req.file.originalname,
            documentPath: req.file.path,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        if (!uploadFile) {
            return res.status(httpCode.BAD_REQUEST).json({
                status: httpCode.BAD_REQUEST,
                message: messageConstant.ERROR_UPLOAD_FILE,
            });
        }

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
        const { id } = req.params;
        const { sortBy, orderBy } = req.query;

        let sortByModel;
        switch (sortBy) {
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
            default:
                res.status(httpCode.UNPROCESSABLE_CONTENT).json({
                    status: httpCode.UNPROCESSABLE_CONTENT,
                    message: messageConstant.INVALID_SORT_PARAMETER,
                });
        }

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

        if (!closeCase) {
            return res.status(httpCode.NOT_FOUND).json({
                status: httpCode.NOT_FOUND,
                message: messageConstant.DATA_NOT_FOUND,
            });
        }

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
 * @function closeCase
 * @param req - Express request object. Expects a parameter `id` representing the case ID.
 * @param res - Express response object used to send back the HTTP response.
 * @returns - Returns a Promise that resolves to an Express response object. The response contains the HTTP status code and a success message.
 * @description This controller function updates the status of a case to 'Closed' and its case tag to 'UnPaid'. It is triggered when a case with the tag 'Close' needs to be updated to reflect its closure. The function responds with a success message upon successful update.
 */
export const closeCase: Controller = async (req, res) => {
    try {
        const { id } = req.params;

        await Request.update(
            { requestStatus: RequestStatus.Closed, caseTag: CaseTag.UnPaid },
            { where: { id, caseTag: CaseTag.Close } },
        );

        return res.status(httpCode.OK).json({
            status: httpCode.OK,
            message: messageConstant.SUCCESS,
        });
    } catch (error) {
        throw error;
    }
};

/**
 * @param req - Express request object, expects `patientPhoneNumber` and `patientEmail` in the body.
 * @param res - Express response object used to send the response.
 * @returns - Returns a Promise that resolves to an Express response object. The response contains the status code, a success message, and the updated case data.
 * @description This function is an Express controller that updates the phone number and email of a patient in a case.
 */
export const editCloseCase: Controller = async (req, res) => {
    try {
        const { patientPhoneNumber, patientEmail } = req.body;

        await Request.update(
            {
                patientPhoneNumber,
                patientEmail,
            },
            {
                where: {
                    id: req.params.id,
                },
            },
        );

        return res.status(httpCode.OK).json({
            status: httpCode.OK,
            message: messageConstant.SUCCESS,
        });
    } catch (error) {
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
        const { message } = req.body;
        const unScheduledPhysician = await User.findAll({
            where: { accountType: 'Physician', onCallStatus: 'UnScheduled' },
        });

        for (const physician of unScheduledPhysician) {
            console.log(
                `Sending message to ${physician.firstName}, \n ${message}`,
            );
        }

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
    try {
        const { physicianId, transferNote } = req.body;
        const { id } = req.params;

        await Request.update({ physicianId, transferNote }, { where: { id } });

        return res.status(httpCode.OK).json({
            status: httpCode.OK,
            message: messageConstant.SUCCESS,
        });
    } catch (error) {
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
        const { firstName, lastName, phoneNumber, email } = req.body;

        const templateData = {
            createRequestLink: linkConstant.REQUEST_URL,
            patientName: firstName + ' ' + lastName,
        };

        const data = await compileEmailTemplate(
            'sendRequestEmail',
            templateData,
        );

        const messageBody =
            'Here you are selected for Maidaan. accept it otherwise we will see you.';
        sendSMS(messageBody);

        const mailOptions = {
            from: process.env.EMAIL_FROM,
            to: email,
            subject: linkConstant.createRequestSubject,
            html: data,
        };

        return transporter.sendMail(mailOptions, (error: Error) => {
            if (error) {
                throw error;
            } else {
                return res.json({
                    status: httpCode.OK,
                    message: messageConstant.REQUEST_EMAIL_SMS_SENT,
                });
            }
        });
    } catch (error) {
        throw error;
    }
};
