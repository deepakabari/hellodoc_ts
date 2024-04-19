import { CallType, CaseTag, RequestStatus } from '../../../utils/enum.constant';
import httpCode from '../../../constants/http.constant';
import messageConstant from '../../../constants/message.constant';
import { Controller } from '../../../interfaces';
import dotenv from 'dotenv';
dotenv.config();
import { MedicalReport, Request } from '../../../db/models/index';
import { FindAttributeOptions, Includeable, Op, where } from 'sequelize';
import { Request as ExpressRequest, Response } from 'express';
import { compileEmailTemplate } from '../../../utils/hbsCompiler';
import { sequelize } from '../../../db/config/db.connection';
import pdf from 'html-pdf';

/**
 * @function requestCount
 * @param -req - Express request object
 * @param - res - Express response object
 * @returns - - Promise representing the completion of the operation
 * @description Counts requests based on different case tags and sends the count as response
 */
export const requestCount: Controller = async (req, res) => {
    try {
        // Get all case tags
        const allCaseTags: CaseTag[] = Object.values(CaseTag);

        // Find request counts for each case tag
        const requestCounts = await Request.findAll({
            attributes: [
                'caseTag',
                [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
            ],
            where: {
                caseTag: {
                    [Op.in]: allCaseTags,
                },
                requestStatus: {
                    [Op.in]: [
                        RequestStatus.Unassigned,
                        RequestStatus.Accepted,
                        RequestStatus.Consult,
                        RequestStatus.MDOnRoute,
                        RequestStatus.MDOnSite,
                    ],
                },
                physicianId: req.user.id,
            },
            group: 'caseTag',
            raw: true,
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
        throw error;
    }
};

/**
 * @function getPatientByState
 * @param -req - Express request object
 * @param - res - Express response object
 * @returns - - Promise representing the completion of the operation
 * @description Retrieves patients based on their state and other optional filters
 */
export const getPatientByState: Controller = async (req, res) => {
    try {
        const { requestType, search, state, page, pageSize } = req.query;

        // Parsing page number and page size, defaulting to 1 and 10 respectively if not provided
        const pageNumber = parseInt(page as string, 10) || 1;
        const limit = parseInt(pageSize as string, 10) || 10;
        const offset = (pageNumber - 1) * limit;

        // Attributes to retrieve from the database
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
            ['requestType', 'Requestor Type'],
            'requestorPhoneNumber',
            'callType',
        ];

        let condition;
        let includeModels = [
            {
                model: MedicalReport,
                attributes: ['isFinalize'],
                where: {
                    id: sequelize.col('Request.physicianId'),
                },
                required: false,
            },
        ];
        let requestTypeWhereClause = {};
        if (requestType && requestType !== 'all') {
            requestTypeWhereClause = { requestType: requestType as string };
        }

        // Constructing where clause based on state
        switch (state) {
            case 'new':
                condition = {
                    caseTag: CaseTag.New,
                    requestStatus: RequestStatus.Unassigned,
                    physicianId: req.user.id,
                };
                break;
            case 'pending':
                condition = {
                    caseTag: CaseTag.Pending,
                    requestStatus: RequestStatus.Accepted,
                    physicianId: req.user.id,
                };
                break;
            case 'active':
                condition = {
                    caseTag: CaseTag.Active,
                    isAgreementAccepted: true,
                    physicianId: req.user.id,
                };
                break;
            case 'conclude':
                condition = {
                    caseTag: CaseTag.Conclude,
                    requestStatus: RequestStatus.Consult,
                    physicianId: req.user.id,
                };
                break;
            default:
                return res.status(httpCode.INTERNAL_SERVER_ERROR).json({
                    status: httpCode.INTERNAL_SERVER_ERROR,
                    message: messageConstant.INTERNAL_SERVER_ERROR,
                });
        }

        // Finding patients based on condition and optional search and requestType
        const patients = await Request.findAndCountAll({
            attributes: attributes as FindAttributeOptions,
            include: includeModels as unknown as Includeable[],
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
                ...requestTypeWhereClause,
            },
            limit,
            offset,
        });

        // Sending response with patients data
        return res.status(httpCode.OK).json({
            status: httpCode.OK,
            message: messageConstant.REQUEST_RETRIEVED,
            data: patients,
        });
    } catch (error) {
        throw error;
    }
};

/**
 * @function acceptRequest
 * @param -req - Express request object
 * @param - res - Express response object
 * @returns - - Promise representing the completion of the operation
 * @description Accepts a request and updates its status to Accepted
 */
export const acceptRequest: Controller = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { id } = req.params;

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
                caseTag: CaseTag.Pending,
                requestStatus: RequestStatus.Accepted,
            },
            { where: { id } },
        );

        await transaction.commit();

        // Sending response indicating request is accepted
        return res.status(httpCode.OK).json({
            status: httpCode.OK,
            message: messageConstant.REQUEST_ACCEPTED,
        });
    } catch (error) {
        await transaction.rollback();
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
    // Start a new transaction
    const transaction = await sequelize.transaction();
    try {
        // Extract id from request parameter
        const { id } = req.params;

        // Take adminNotes from request body
        const { physicianNotes } = req.body;

        // Check if request exists or not
        const exists = await Request.findByPk(id);
        if (!exists) {
            // Rollback transaction if request does not exist
            await transaction.rollback();
            return res.status(httpCode.BAD_REQUEST).json({
                status: httpCode.BAD_REQUEST,
                message: messageConstant.REQUEST_NOT_FOUND,
            });
        }

        // To update note in the adminNotes in request table
        await Request.update(
            {
                physicianNotes,
            },
            { where: { id } },
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
 * @function concludeCare
 * @param -req - Express request object
 * @param - res - Express response object
 * @returns - - Promise representing the completion of the operation
 * @description Concludes care for a request by updating its status and adding physician notes
 */
export const concludeCare: Controller = async (req, res) => {
    // Start a new transaction
    const transaction = await sequelize.transaction();
    try {
        const { id } = req.params;

        const { providerNotes } = req.body;

        // Check if request exists or not
        const exists = await Request.findByPk(id);
        if (!exists) {
            // Rollback transaction if request does not exist
            await transaction.rollback();
            return res.status(httpCode.BAD_REQUEST).json({
                status: httpCode.BAD_REQUEST,
                message: messageConstant.REQUEST_NOT_FOUND,
            });
        }

        const finalize = await MedicalReport.findOne({
            where: { requestId: id },
        });

        if (!finalize?.isFinalize) {
            // Rollback transaction if form is not finalized
            await transaction.rollback();
            return res.status(httpCode.BAD_REQUEST).json({
                status: httpCode.BAD_REQUEST,
                message: messageConstant.FORM_NOT_FINALIZED,
            });
        }

        // Update request status to Conclude and add physician notes
        await Request.update(
            {
                physicianNotes: providerNotes,
                caseTag: CaseTag.Close,
                requestStatus: RequestStatus.Conclude,
            },
            { where: { id } },
        );

        // Commit the transaction after all operations are successful
        await transaction.commit();

        // Sending response indicating care is concluded
        return res.status(httpCode.OK).json({
            status: httpCode.OK,
            message: messageConstant.CARE_CONCLUDED,
        });
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

/**
 * @function typeOfCare
 * @param -req - Express request object
 * @param - res - Express response object
 * @returns - - Promise representing the completion of the operation
 * @description Updates type of care for a request
 */
export const typeOfCare: Controller = async (req, res) => {
    try {
        const { id } = req.params;

        const { typeOfCare } = req.body;

        const exists = await Request.findByPk(id);
        if (!exists) {
            return res.status(httpCode.BAD_REQUEST).json({
                status: httpCode.BAD_REQUEST,
                message: messageConstant.REQUEST_NOT_FOUND,
            });
        }

        let callType, requestStatus, caseTag;

        // Determine callType, requestStatus, and caseTag based on typeOfCare
        if (typeOfCare === 'HouseCall') {
            callType = CallType.HouseCall;
            requestStatus = RequestStatus.MDOnSite;
            caseTag = CaseTag.Active;
        } else if (typeOfCare === 'Consult') {
            callType = CallType.Consult;
            requestStatus = RequestStatus.Consult;
            caseTag = CaseTag.Conclude;
        } else {
            // Return error response for invalid typeOfCare
            return res.status(httpCode.BAD_REQUEST).json({
                status: httpCode.BAD_REQUEST,
                message: messageConstant.INVALID_TYPE_CARE,
            });
        }

        // Update request with new type of care
        await Request.update(
            {
                callType,
                requestStatus,
                caseTag,
            },
            { where: { id } },
        );

        // Sending response indicating request is updated
        return res.status(httpCode.OK).json({
            status: httpCode.OK,
            message: messageConstant.REQUEST_UPDATED,
        });
    } catch (error) {
        throw error;
    }
};

export const houseCallType: Controller = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if the request exists
        const exists = await Request.findByPk(id);
        if (!exists) {
            return res.status(httpCode.BAD_REQUEST).json({
                status: httpCode.BAD_REQUEST,
                message: messageConstant.REQUEST_NOT_FOUND,
            });
        }

        // Update the request to mark as house call type
        await Request.update(
            {
                caseTag: CaseTag.Conclude,
                requestStatus: RequestStatus.Consult,
            },
            { where: { id } },
        );

        // Return success response
        return res.status(httpCode.OK).json({
            status: httpCode.OK,
            message: messageConstant.REQUEST_UPDATED,
        });
    } catch (error) {
        throw error;
    }
};

/**
 * @function transferRequest
 * @param - req - Express request object
 * @param - res - Express response object
 * @returns - - Promise representing the completion of the operation
 * @description Transfers a request to another provider
 */
export const transferRequest: Controller = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { id } = req.params;

        // Extract the transfer description from the request body
        const { description } = req.body;

        // Check if the request exists
        const exists = await Request.findByPk(id);
        if (!exists) {
            await transaction.rollback();
            return res.status(httpCode.BAD_REQUEST).json({
                status: httpCode.BAD_REQUEST,
                message: messageConstant.REQUEST_NOT_FOUND,
            });
        }

        // Update request status to Unassigned and clear physicianId with transfer note
        await Request.update(
            {
                requestStatus: RequestStatus.Unassigned,
                physicianId: null,
                transferNote: description,
                caseTag: CaseTag.New,
            },
            { where: { id } },
        );

        await transaction.commit();

        // Sending response indicating request is transferred
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
 * @function encounterForm
 * @param -req - Express request object
 * @param - res - Express response object
 * @returns - - Promise representing the completion of the operation
 * @description Creates a new medical report for a request
 */
export const encounterForm: Controller = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if encounter form already exists
        const existingForm = await MedicalReport.findOne({
            where: { requestId: id },
        });

        if (existingForm) {
            // Return error response if encounter form already exists
            return res.status(httpCode.BAD_REQUEST).json({
                status: httpCode.BAD_REQUEST,
                message: messageConstant.FORM_FOUND,
            });
        }

        // Create new encounter form
        const encounterForm = await MedicalReport.create({
            requestId: id,
            ...req.body,
            isFinalize: false,
        });

        // Sending response indicating encounter form is created
        return res.status(httpCode.OK).json({
            status: httpCode.OK,
            message: messageConstant.FORM_CREATED,
            data: encounterForm,
        });
    } catch (error) {
        throw error;
    }
};

/**
 * @function finalizeForm
 * @param -req - Express request object
 * @param - res - Express response object
 * @returns - - Promise representing the completion of the operation
 * @description Finalizes a medical report
 */
export const finalizeForm: Controller = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { id } = req.params;

        const exists = await MedicalReport.findOne({
            where: { requestId: id },
        });
        if (!exists) {
            await transaction.rollback();
            return res.status(httpCode.BAD_REQUEST).json({
                status: httpCode.BAD_REQUEST,
                message: messageConstant.INVALID_INPUT,
            });
        }

        // Update medical report to finalize
        await MedicalReport.update(
            {
                isFinalize: true,
            },
            { where: { requestId: id } },
        );

        transaction.commit();

        // Sending response indicating form is finalized
        return res.status(httpCode.OK).json({
            status: httpCode.OK,
            message: messageConstant.FORM_FINALIZED,
        });
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

/**
 * @function viewEncounterForm
 * @param -req - Express request object
 * @param - res - Express response object
 * @returns - - Promise representing the completion of the operation
 * @description Retrieves encounter form data for viewing
 */
export const viewEncounterForm: Controller = async (req, res) => {
    try {
        const { id } = req.params;

        const exists = await MedicalReport.findOne({
            where: { requestId: id },
        });
        if (!exists) {
            return res.status(httpCode.BAD_REQUEST).json({
                status: httpCode.BAD_REQUEST,
                message: messageConstant.FORM_NOT_FOUND,
            });
        }

        // Retrieve encounter form data
        const viewEncounterForm = await MedicalReport.findAll({
            attributes: [
                'id',
                'firstName',
                'lastName',
                'location',
                'dob',
                'serviceDate',
                'phoneNumber',
                'email',
                'presentIllnessHistory',
                'medicalHistory',
                'medications',
                'allergies',
                'temperature',
                'heartRate',
                'repositoryRate',
                'sisBP',
                'diaBP',
                'oxygen',
                'pain',
                'heent',
                'cv',
                'chest',
                'abd',
                'extr',
                'skin',
                'neuro',
                'other',
                'diagnosis',
                'treatmentPlan',
                'medicationDispensed',
                'procedure',
                'followUp',
                'isFinalize',
            ],
            where: { requestId: id },
        });

        // Sending response with encounter form data
        return res.status(httpCode.OK).json({
            status: httpCode.OK,
            message: messageConstant.DATA_RETRIEVED,
            data: viewEncounterForm,
        });
    } catch (error) {
        throw error;
    }
};

/**
 * @function editEncounterForm
 * @param -req - Express request object
 * @param - res - Express response object
 * @returns - - Promise representing the completion of the operation
 * @description Edits an existing encounter form
 */
export const editEncounterForm: Controller = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { id } = req.params;

        const exists = await MedicalReport.findByPk(id);
        if (!exists) {
            await transaction.rollback();
            return res.status(httpCode.BAD_REQUEST).json({
                status: httpCode.BAD_REQUEST,
                message: messageConstant.FORM_NOT_FOUND,
            });
        }

        // Update encounter form
        await MedicalReport.update(
            {
                ...req.body,
            },
            {
                where: { id },
            },
        );

        await transaction.commit();

        // Sending response indicating encounter form is updated
        return res.status(httpCode.OK).json({
            status: httpCode.OK,
            message: messageConstant.FORM_UPDATED,
        });
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

/**
 * @function downloadEncounter
 * @param -req - Express request object
 * @param - res - Express response object
 * @returns - - Promise representing the completion of the operation
 * @description Downloads encounter form as PDF
 */
export const downloadEncounter = async (req: ExpressRequest, res: Response) => {
    try {
        const { id } = req.params;

        const exists = await MedicalReport.findOne({
            where: { requestId: id },
        });
        if (!exists) {
            return res.status(httpCode.BAD_REQUEST).json({
                status: httpCode.BAD_REQUEST,
                message: messageConstant.REQUEST_NOT_FOUND,
            });
        }

        const token = req.headers.authorization as string;

        // Fetch encounter form data from API
        const apiUrl = `http://localhost:4000/provider/dashboard/viewEncounterForm/${id}`;

        const response = await fetch(apiUrl, {
            headers: {
                Authorization: token,
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch data: ${response.statusText}`);
        }

        // Parse JSON response
        const jsonData: any = await response.json();

        const html = await compileEmailTemplate('encounterPdf', {
            encounterData: jsonData.data[0],
        });

        const options: any = { format: 'Letter' };

        pdf.create(html, options).toBuffer((err, buffer) => {
            if (err) {
                console.error('Error creating PDF', err);
                return;
            }

            // Set response headers for PDF download
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader(
                'Content-Disposition',
                'attachment; filename=encounter_form.pdf',
            );

            // Send the PDF buffer as the response
            res.send(buffer);
        });
    } catch (error) {
        throw error;
    }
};
