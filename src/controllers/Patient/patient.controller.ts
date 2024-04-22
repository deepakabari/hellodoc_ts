import { CaseTag, RequestStatus } from '../../utils/enum.constant';
import httpCode from '../../constants/http.constant';
import messageConstant from '../../constants/message.constant';
import { Controller } from '../../interfaces';
import { Request, RequestWiseFiles, User } from '../../db/models/index';
import dotenv from 'dotenv';
import { sequelize } from '../../db/config/db.connection';
dotenv.config();

export const acceptAgreement: Controller = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { id } = req.params;

        // Check if the request exists
        const exists = await Request.findByPk(id);
        if (!exists) {
            await transaction.rollback();
            return res.status(httpCode.BAD_REQUEST).json({
                status: httpCode.BAD_REQUEST,
                message: messageConstant.REQUEST_NOT_FOUND,
            });
        }

        // Update the request to mark agreement accepted
        await Request.update(
            {
                caseTag: CaseTag.Active,
                requestStatus: RequestStatus.MDOnRoute,
                isAgreementAccepted: true,
            },
            {
                where: { id },
                transaction,
            },
        );

        await transaction.commit();

        // Return success response
        return res.status(httpCode.OK).json({
            status: httpCode.OK,
            message: messageConstant.AGREEMENT_ACCEPTED,
        });
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

export const cancelAgreement: Controller = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { id } = req.params;
        const { reasonForCancellation } = req.body;

        // Check if the request exists
        const exists = await Request.findByPk(id);
        if (!exists) {
            await transaction.rollback();
            return res.status(httpCode.BAD_REQUEST).json({
                status: httpCode.BAD_REQUEST,
                message: messageConstant.REQUEST_NOT_FOUND,
            });
        }

        // Update the request to mark agreement cancelled
        await Request.update(
            {
                reasonForCancellation,
                requestStatus: RequestStatus.Declined,
                caseTag: CaseTag.Close,
            },
            { where: { id }, transaction },
        );

        await transaction.commit();

        // Return success response
        return res.status(httpCode.OK).json({
            status: httpCode.OK,
            message: messageConstant.AGREEMENT_CANCELLED,
        });
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

export const medicalHistory: Controller = async (req, res) => {
    try {
        const id = req.user.id;

        // Find and count all requests associated with the patient
        const medicalHistory = await Request.findAndCountAll({
            attributes: ['id', 'createdAt', 'requestStatus'],
            where: {
                userId: id,
            },
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
    const transaction = await sequelize.transaction();
    try {
        const id = req.user.id;

        // Extract profile information from request body
        const {
            firstName,
            lastName,
            email,
            dob,
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
                phoneNumber,
                street,
                city,
                state,
                zipCode,
            },
            { where: { id }, transaction },
        );

        await transaction.commit();

        // Return success response
        return res.status(httpCode.OK).json({
            status: httpCode.OK,
            message: messageConstant.PROFILE_UPDATED,
        });
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};
