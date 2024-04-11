import { CaseTag, RequestStatus } from '../../../utils/enum.constant';
import httpCode from '../../../constants/http.constant';
import messageConstant from '../../../constants/message.constant';
import { Controller } from '../../../interfaces';
import dotenv from 'dotenv';
dotenv.config();

export const getPatientByState: Controller = async (req, res) => {
    try {
        const { requestType, search, state, page, pageSize } = req.query;

        const pageNumber = parseInt(page as string, 10) || 1;
        const limit = parseInt(pageSize as string, 10) || 10;
        const offset = (pageNumber - 1) * limit;

        let attributes = [
            'id',
            'patientFirstName',
            'patientLastName',
            'patientPhoneNumber',
            'street',
            'city',
            'state',
            'zipCode',
            'requestType',
            'requestorPhoneNumber',
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
                    physicianId: req.user.id,
                    requestStatus: RequestStatus.Unassigned,
                };
                break;
            case 'pending':
                condition = {
                    caseTag: CaseTag.Pending,
                };
        }

        return res.status(httpCode.OK).json({
            status: httpCode.OK,
            message: messageConstant.REQUEST_RETRIEVED,
        });
    } catch (error) {
        throw error;
    }
};
