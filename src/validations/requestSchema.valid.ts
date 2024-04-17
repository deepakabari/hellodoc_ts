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
            patientPhoneNumber: Joi.string()
                .required()
                .min(11)
                .max(13)
                .messages({
                    'string.min': 'Phone number must be a 10 digit number', // Custom message for min length
                    'string.max': 'Phone number must not exceed 13 digits', // Custom message for max length
                    'string.required': 'Phone number is required', // Custom message for required
                }),
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
            patientPhoneNumber: Joi.string()
                .required()
                .min(11)
                .max(13)
                .messages({
                    'string.min': 'Phone number must be a 10 digit number', // Custom message for min length
                    'string.max': 'Phone number must not exceed 13 digits', // Custom message for max length
                    'string.required': 'Phone number is required', // Custom message for required
                }),
            requestorFirstName: Joi.string().optional().allow('', null),
            requestorLastName: Joi.string().optional().allow('', null),
            requestorPhoneNumber: Joi.string().min(11).max(13).messages({
                'string.min': 'Phone number must be a 10 digit number', // Custom message for min length
                'string.max': 'Phone number must not exceed 13 digits', // Custom message for max length
                'string.required': 'Phone number is required', // Custom message for required
            }),
            requestorEmail: Joi.string().optional().email().allow('', null),
            isEmail: Joi.boolean().required(),
            password: Joi.string()
                .regex(RegExp(linkConstant.PASSWORD_REGEX))
                .optional()
                .allow('', null),
            relationName: Joi.string().optional().allow('', null),
            street: Joi.string().required(),
            dob: Joi.date().required(),
            city: Joi.string().required().allow('', null),
            state: Joi.string().required().allow('', null),
            zipCode: Joi.string().optional().allow('', null),
            roomNumber: Joi.string().optional().allow('', null),
            document: Joi.string().optional().allow('', null),
        }).unknown(true),
    },
};
