import { CallType, CaseTag, RequestStatus } from '../../../utils/enum.constant';
import httpCode from '../../../constants/http.constant';
import messageConstant from '../../../constants/message.constant';
import { Controller } from '../../../interfaces';
import dotenv from 'dotenv';
dotenv.config();
import { MedicalReport, Request } from '../../../db/models/index';
import { FindAttributeOptions, Op, where } from 'sequelize';
import sequelize from 'sequelize';
import { Request as ExpressRequest, Response } from 'express';
import PDFDocument from 'pdfkit';

export const requestCount: Controller = async (req, res) => {
    try {
        const allCaseTags: CaseTag[] = Object.values(CaseTag);

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

export const getPatientByState: Controller = async (req, res) => {
    try {
        const { requestType, search, state, page, pageSize } = req.query;

        const pageNumber = parseInt(page as string, 10) || 1;
        const limit = parseInt(pageSize as string, 10) || 10;
        const offset = (pageNumber - 1) * limit;

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
        let requestTypeWhereClause = {};
        if (requestType && requestType !== 'all') {
            requestTypeWhereClause = { requestType: requestType as string };
        }

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
                ...requestTypeWhereClause,
            },
            limit,
            offset,
        });

        return res.status(httpCode.OK).json({
            status: httpCode.OK,
            message: messageConstant.REQUEST_RETRIEVED,
            data: patients,
        });
    } catch (error) {
        throw error;
    }
};

export const acceptRequest: Controller = async (req, res) => {
    try {
        const { id } = req.params;

        await Request.update(
            {
                caseTag: CaseTag.Pending,
                requestStatus: RequestStatus.Accepted,
            },
            { where: { id } },
        );

        return res.status(httpCode.OK).json({
            status: httpCode.OK,
            message: messageConstant.REQUEST_ACCEPTED,
        });
    } catch (error) {
        throw error;
    }
};

export const concludeCare: Controller = async (req, res) => {
    try {
        const { id } = req.params;

        const { providerNotes } = req.body;

        await Request.update(
            {
                physicianNotes: providerNotes,
                caseTag: CaseTag.Close,
                requestStatus: RequestStatus.Conclude,
            },
            { where: { id } },
        );

        return res.status(httpCode.OK).json({
            status: httpCode.OK,
            message: messageConstant.CARE_CONCLUDED,
        });
    } catch (error) {
        throw error;
    }
};

export const typeOfCare: Controller = async (req, res) => {
    try {
        const { id } = req.params;

        const { typeOfCare } = req.body;

        let callType, requestStatus, caseTag;

        if (typeOfCare === 'houseCall') {
            callType = CallType.HouseCall;
            requestStatus = RequestStatus.MDOnSite;
            caseTag = CaseTag.Active;
        } else if (typeOfCare === 'consult') {
            callType = CallType.Consult;
            requestStatus = RequestStatus.Consult;
            caseTag = CaseTag.Conclude;
        } else {
            return res.status(httpCode.BAD_REQUEST).json({
                status: httpCode.BAD_REQUEST,
                message: messageConstant.INVALID_TYPE_CARE,
            });
        }

        await Request.update(
            {
                callType,
                requestStatus,
                caseTag,
            },
            { where: { id } },
        );

        return res.status(httpCode.OK).json({
            status: httpCode.OK,
            message: messageConstant.REQUEST_UPDATED,
        });
    } catch (error) {
        throw error;
    }
};

export const transferRequest: Controller = async (req, res) => {
    try {
        const { id } = req.params;

        const { description } = req.body;

        await Request.update(
            {
                requestStatus: RequestStatus.Unassigned,
                physicianId: null,
                transferNote: description,
                caseTag: CaseTag.New,
            },
            { where: { id } },
        );

        return res.status(httpCode.OK).json({
            status: httpCode.OK,
            message: messageConstant.REQUEST_TRANSFERRED,
        });
    } catch (error) {
        throw error;
    }
};

export const encounterForm: Controller = async (req, res) => {
    try {
        const { id } = req.params;

        const existingForm = await MedicalReport.findOne({
            where: { requestId: id },
        });

        if (existingForm) {
            return res.status(httpCode.BAD_REQUEST).json({
                status: httpCode.BAD_REQUEST,
                message: messageConstant.FORM_FOUND,
            });
        }

        const encounterForm = await MedicalReport.create({
            requestId: id,
            ...req.body,
            isFinalize: false,
        });

        return res.status(httpCode.OK).json({
            status: httpCode.OK,
            message: messageConstant.FORM_CREATED,
            data: encounterForm,
        });
    } catch (error) {
        throw error;
    }
};

export const finalizeForm: Controller = async (req, res) => {
    try {
        const { id } = req.params;

        await MedicalReport.update(
            {
                isFinalize: true,
            },
            { where: { id } },
        );

        return res.status(httpCode.OK).json({
            status: httpCode.OK,
            message: messageConstant.FORM_FINALIZED,
        });
    } catch (error) {
        throw error;
    }
};

export const viewEncounterForm: Controller = async (req, res) => {
    try {
        const { id } = req.params;

        const viewEncounterForm = await MedicalReport.findAll({
            attributes: [
                'id',
                'serviceDate',
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
            ],
            include: [
                {
                    model: Request,
                    attributes: [
                        'id',
                        'patientFirstName',
                        'patientLastName',
                        'patientEmail',
                        'street',
                        'city',
                        'state',
                        'zipCode',
                        'dob',
                        'patientPhoneNumber',
                    ],
                },
            ],
            where: { requestId: id },
        });

        return res.status(httpCode.OK).json({
            status: httpCode.OK,
            message: messageConstant.DATA_RETRIEVED,
            data: viewEncounterForm,
        });
    } catch (error) {
        throw error;
    }
};

export const editEncounterForm: Controller = async (req, res) => {
    try {
        const { id } = req.params;

        await MedicalReport.update(
            {
                ...req.body,
            },
            {
                where: { id },
            },
        );

        return res.status(httpCode.OK).json({
            status: httpCode.OK,
            message: messageConstant.FORM_UPDATED,
        });
    } catch (error) {
        throw error;
    }
};

export const downloadEncounter = async (req: ExpressRequest, res: Response) => {
    try {
        const { id } = req.params;

        const token = req.headers.authorization as string;

        const apiUrl = `http:localhost:4000/provider/dashboard/viewEncounterForm/${id}`;

        const response = await fetch(apiUrl, {
            headers: {
                Authorization: token,
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch data: ${response.statusText}`);
        }

        const jsonData: any = await response.json();

        const encounterData = jsonData.data[0];

        const doc = new PDFDocument();

        doc.font('Courier-BoldOblique');
        doc.fontSize(24)
            .fillColor('#03c6fc')
            .text('Medical Report-Confidential', {
                align: 'center', // Center align the heading
            });
        doc.fontSize(15).fillColor('black');
        doc.moveDown();
        doc.moveDown();
        doc.text(`First Name: ${encounterData.request.patientFirstName}`);
        doc.moveDown();
        doc.text(`Last Name: ${encounterData.request.patientLastName}`);
        doc.moveDown();
        doc.text(
            `Location: ${encounterData.request.street}, ${encounterData.request.city}, ${encounterData.request.state} - ${encounterData.request.zipCode}.`,
        );
        doc.moveDown();
        doc.text(`Date of Birth: ${encounterData.request.dob}`);
        doc.moveDown();
        doc.text(`Service Date: ${encounterData.serviceDate}`);
        doc.moveDown();
        doc.text(`Phone Number: ${encounterData.request.patientPhoneNumber}`);
        doc.moveDown();
        doc.text(`Email: ${encounterData.request.patientEmail}`);
        doc.moveDown();
        doc.text(
            `History Of Present illness Or injury: ${encounterData.presentIllnessHistory}`,
        );
        doc.moveDown();
        doc.text(`Medical History: ${encounterData.medicalHistory}`);
        doc.moveDown();
        doc.text(`Medications: ${encounterData.medications}`);
        doc.moveDown();
        doc.text(`Allergies: ${encounterData.allergies}`);
        doc.moveDown();
        doc.text(`Temperature: ${encounterData.temperature}`);
        doc.moveDown();
        doc.text(`Heart Rate: ${encounterData.heartRate}`);
        doc.moveDown();
        doc.text(`Repository Rate: ${encounterData.repositoryRate}`);
        doc.moveDown();
        doc.text(`Blood Pressure(systolic): ${encounterData.sisBP}`);
        doc.moveDown();
        doc.text(`Blood Pressure(diastolic): ${encounterData.diaBP}`);
        doc.moveDown();
        doc.text(`Oxygen: ${encounterData.oxygen}`);
        doc.moveDown();
        doc.text(`Pain: ${encounterData.pain}`);
        doc.moveDown();
        doc.text(`Heent: ${encounterData.heent}`);
        doc.moveDown();
        doc.text(`CV: ${encounterData.cv}`);
        doc.moveDown();
        doc.text(`Chest: ${encounterData.chest}`);
        doc.moveDown();
        doc.text(`ABD: ${encounterData.abd}`);
        doc.moveDown();
        doc.text(`Extr: ${encounterData.extr}`);
        doc.moveDown();
        doc.text(`Skin: ${encounterData.skin}`);
        doc.moveDown();
        doc.text(`Neuro: ${encounterData.neuro}`);
        doc.moveDown();
        doc.text(`Other: ${encounterData.other}`);
        doc.moveDown();
        doc.text(`Diagnosis: ${encounterData.diagnosis}`);
        doc.moveDown();
        doc.text(`Treatment Plan: ${encounterData.treatmentPlan}`);
        doc.moveDown();
        doc.text(`Medication Dispensed: ${encounterData.medicationDispensed}`);
        doc.moveDown();
        doc.text(`Procedure: ${encounterData.procedure}`);
        doc.moveDown();
        doc.text(`Followup: ${encounterData.followUp}`);
        doc.moveDown();

        const buffer: Buffer = await new Promise((resolve, reject) => {
            const chunks: Uint8Array[] = [];
            doc.on('data', (chunk) => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.end();
        });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader(
            'Content-Disposition',
            'attachment; filename=encounter_form.pdf',
        );

        // Send the PDF buffer as the response
        res.send(buffer);
    } catch (error) {
        throw error;
    }
};
