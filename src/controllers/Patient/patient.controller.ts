import { CaseTag, RequestStatus } from '../../utils/enum.constant';
import httpCode from '../../constants/http.constant';
import messageConstant from '../../constants/message.constant';
import { Controller } from '../../interfaces';
import { Request, RequestWiseFiles, User } from '../../db/models/index';
import dotenv from 'dotenv';
import { sequelize } from '../../db/config/db.connection';
import { validateAndDecryptToken } from '../../utils/encryptdecrypt';
import { Order } from 'sequelize';
dotenv.config();

export const acceptAgreement: Controller = async (req, res) => {
    try {
        const { id } = req.params;

        const originalId = validateAndDecryptToken(id);

        // Check if the request exists
        const exists = await Request.findOne({
            where: {
                agreementToken: id,
            },
        });
        if (!exists) {
            return res.status(httpCode.BAD_REQUEST).json({
                status: httpCode.BAD_REQUEST,
                message: messageConstant.INVALID_RESET_TOKEN,
            });
        }

        // Update the request to mark agreement accepted
        await Request.update(
            {
                caseTag: CaseTag.Active,
                requestStatus: RequestStatus.MDOnRoute,
                isAgreementAccepted: true,
                agreementToken: null,
            },
            {
                where: { id: originalId },
            },
        );

        // Return success response
        return res.status(httpCode.OK).json({
            status: httpCode.OK,
            message: messageConstant.AGREEMENT_ACCEPTED,
        });
    } catch (error) {
        throw error;
    }
};

export const cancelAgreement: Controller = async (req, res) => {
    try {
        const { id } = req.params;
        const { reasonForCancellation } = req.body;

        const originalId = validateAndDecryptToken(id);

        const exists = await Request.findOne({
            where: {
                agreementToken: id,
            },
        });

        // Check if the request exists
        if (!exists) {
            return res.status(httpCode.BAD_REQUEST).json({
                status: httpCode.BAD_REQUEST,
                message: messageConstant.INVALID_RESET_TOKEN,
            });
        }

        // Update the request to mark agreement cancelled
        await Request.update(
            {
                reasonForCancellation,
                requestStatus: RequestStatus.Declined,
                caseTag: CaseTag.Close,
                agreementToken: null,
            },
            { where: { id: originalId } },
        );

        // Return success response
        return res.status(httpCode.OK).json({
            status: httpCode.OK,
            message: messageConstant.AGREEMENT_CANCELLED,
        });
    } catch (error) {
        throw error;
    }
};

export const medicalHistory: Controller = async (req, res) => {
    try {
        const id = req.user.id;

        const { sortBy, orderBy, page, pageSize } = req.query;

        // Calculate pagination parameters
        const pageNumber = parseInt(page as string, 10) || 1;
        const limit = parseInt(pageSize as string, 10) || 10;
        const offset = (pageNumber - 1) * limit;

        // Define sorting order based on query parameters
        const order = sortBy && orderBy ? ([[sortBy, orderBy]] as Order) : [];

        // Find and count all requests associated with the patient
        const medicalHistory = await Request.findAndCountAll({
            attributes: [
                'id',
                'createdAt',
                'requestStatus',
                [
                    sequelize.literal(`(
                SELECT COUNT(*)
                FROM RequestWiseFiles
                WHERE
                    RequestWiseFiles.requestId = Request.id AND RequestWiseFiles.deletedAt IS NULL
            )`),
                    'filesCount',
                ],
            ],
            where: {
                userId: id,
            },

            order,
            limit,
            offset,
        });

        // Return success response with medical history data
        return res.status(httpCode.OK).json({
            status: httpCode.OK,
            message: messageConstant.REQUEST_RETRIEVED,
            data: medicalHistory,
        });
    } catch (error) {
        throw error;
    }
};

export const editPatientProfile: Controller = async (req, res) => {
    try {
        const id = req.user.id;

        // Extract profile information from request body
        const {
            firstName,
            lastName,
            email,
            dob,
            phoneType,
            phoneNumber,
            street,
            city,
            state,
            zipCode,
        } = req.body;

        // Update the user's profile information
        await User.update(
            {
                firstName,
                lastName,
                email,
                dob,
                phoneType,
                phoneNumber,
                street,
                city,
                state,
                zipCode,
            },
            { where: { id } },
        );

        // Return success response
        return res.status(httpCode.OK).json({
            status: httpCode.OK,
            message: messageConstant.PROFILE_UPDATED,
        });
    } catch (error) {
        throw error;
    }
};
