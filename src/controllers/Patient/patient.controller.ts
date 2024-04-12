import { CaseTag, RequestStatus } from '../../utils/enum.constant';
import httpCode from '../../constants/http.constant';
import messageConstant from '../../constants/message.constant';
import { Controller } from '../../interfaces';
import { Request } from '../../db/models/index';
import dotenv from 'dotenv';
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
