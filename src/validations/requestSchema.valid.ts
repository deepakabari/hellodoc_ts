import { Joi, Segments } from 'celebrate';
import { RequestType } from '../utils/enum.constant';
import linkConstant from '../constants/link.constant';

export const RequestSchema = {
    idParams: {
        [Segments.PARAMS]: {
            id: Joi.number().required(),
        },
    },

    updateNotes: {
        [Segments.BODY]: Joi.object({
            adminNotes: Joi.string().required(),
        }),
        [Segments.PARAMS]: {
            id: Joi.number().required(),
        },
    },

    cancelCase: {
        [Segments.BODY]: Joi.object({
            adminNotes: Joi.string().required(),
            reasonForCancellation: Joi.string().required(),
        }),
        [Segments.PARAMS]: {
            id: Joi.number().required(),
        },
    },

    blockCase: {
        [Segments.BODY]: Joi.object({
            reasonForCancellation: Joi.string().required(),
        }),
        [Segments.PARAMS]: {
            id: Joi.number().required(),
        },
    },

    assignCase: {
        [Segments.BODY]: Joi.object({
            transferNote: Joi.string().required(),
        }).unknown(true),
    },

    closeCase: {
        [Segments.BODY]: Joi.object({
            patientPhoneNumber: Joi.string().required().min(10).max(10),
            patientEmail: Joi.string().required().email(),
        }),
    },

    createRequest: {
        [Segments.BODY]: Joi.object({
            requestType: Joi.string()
                .valid(...Object.values(RequestType))
                .required(),
            patientFirstName: Joi.string().required(),
            patientLastName: Joi.string().required(),
            patientEmail: Joi.string().required().email(),
            patientPhoneNumber: Joi.string().required().min(10).max(10),
            requestorFirstName: Joi.string().optional(),
            requestorLastName: Joi.string().optional(),
            requestorPhoneNumber: Joi.string().optional().min(10).max(10),
            requestorEmail: Joi.string().optional().email(),
            isEmail: Joi.boolean().required(),
            password: Joi.string()
                .when('isEmail', {
                    is: true,
                    then: Joi.optional().allow('', null),
                    otherwise: Joi.required(),
                })
                .regex(RegExp(linkConstant.PASSWORD_REGEX)),
            relationName: Joi.string().optional(),
            street: Joi.string().required(),
            dob: Joi.date().required(),
            city: Joi.string().required(),
            state: Joi.string().required(),
            zipCode: Joi.string().required(),
            roomNumber: Joi.string().optional(),
        }).unknown(true),
    },
};
