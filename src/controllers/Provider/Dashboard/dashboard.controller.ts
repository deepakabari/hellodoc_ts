import { CaseTag, RequestStatus } from '../../../utils/enum.constant';
import httpCode from '../../../constants/http.constant';
import messageConstant from '../../../constants/message.constant';
import { Controller } from '../../../interfaces';
import dotenv from 'dotenv';
dotenv.config();
import { Request } from '../../../db/models/index';
import { Op } from 'sequelize';

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
            attributes: attributes,
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
