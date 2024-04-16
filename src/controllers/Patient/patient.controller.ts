import { CaseTag, RequestStatus } from '../../utils/enum.constant';
import httpCode from '../../constants/http.constant';
import messageConstant from '../../constants/message.constant';
import { Controller } from '../../interfaces';
import { Request, RequestWiseFiles, User } from '../../db/models/index';
import dotenv from 'dotenv';
import { where } from 'sequelize';
dotenv.config();

export const acceptAgreement: Controller = async (req, res) => {
    try {
        const { id } = req.params;

        await Request.update(
            {
                caseTag: CaseTag.Active,
                requestStatus: RequestStatus.MDOnRoute,
                isAgreementAccepted: true,
            },
            {
                where: { id },
            },
        );

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

        await Request.update(
            {
                reasonForCancellation,
                requestStatus: RequestStatus.Declined,
                caseTag: CaseTag.Close,
            },
            { where: { id } },
        );

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

        const medicalHistory = await Request.findAndCountAll({
            attributes: ['id', 'createdAt', 'requestStatus'],
            where: {
                userId: id,
            },
            include: [
                {
                    model: RequestWiseFiles,
                    attributes: ['id', 'fileName', 'docType', 'documentPath'],
                    required: false,
                },
            ],
        });

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
            { where: { id } },
        );

        return res.status(httpCode.OK).json({
            status: httpCode.OK,
            message: messageConstant.PROFILE_UPDATED,
        });
    } catch (error) {
        throw error;
    }
};
