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
            adminNotes: Joi.string().trim().required(),
        }),
        [Segments.PARAMS]: {
            id: Joi.number().required(),
        },
    },

    cancelCase: {
        [Segments.BODY]: Joi.object({
            adminNotes: Joi.string().trim().required(),
            reasonForCancellation: Joi.string().required(),
        }),
        [Segments.PARAMS]: {
            id: Joi.number().required(),
        },
    },

    blockCase: {
        [Segments.BODY]: Joi.object({
            reasonForCancellation: Joi.string().trim().required(),
        }),
        [Segments.PARAMS]: {
            id: Joi.number().required(),
        },
    },

    assignCase: {
        [Segments.BODY]: Joi.object({
            physicianId: Joi.number().required(),
            transferNote: Joi.string().trim().required(),
        }),
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
            patientEmail: Joi.string().trim().required().email(),
        }),
    },

    createRequest: {
        [Segments.BODY]: Joi.object({
            requestType: Joi.string()
                .valid(...Object.values(RequestType))
                .required(),
            patientFirstName: Joi.string().trim().required(),
            patientLastName: Joi.string().trim().required(),
            patientEmail: Joi.string().trim().required().email(),
            patientPhoneNumber: Joi.string()
                .required()
                .min(11)
                .max(13)
                .messages({
                    'string.min': 'Phone number must be a 10 digit number', // Custom message for min length
                    'string.max': 'Phone number must not exceed 13 digits', // Custom message for max length
                    'string.required': 'Phone number is required', // Custom message for required
                }),
            requestorFirstName: Joi.string().trim().optional().allow('', null),
            requestorLastName: Joi.string().trim().optional().allow('', null),
            requestorPhoneNumber: Joi.string().min(11).max(13).messages({
                'string.min': 'Phone number must be a 10 digit number', // Custom message for min length
                'string.max': 'Phone number must not exceed 13 digits', // Custom message for max length
                'string.required': 'Phone number is required', // Custom message for required
            }),
            requestorEmail: Joi.string()
                .trim()
                .optional()
                .email()
                .allow('', null),
            isEmail: Joi.boolean().required(),
            password: Joi.string()
                .regex(RegExp(linkConstant.PASSWORD_REGEX))
                .optional()
                .allow('', null),
            relationName: Joi.string().trim().optional().allow('', null),
            street: Joi.string().trim().required(),
            dob: Joi.date().required(),
            city: Joi.string().trim().required().allow('', null),
            state: Joi.string().trim().required().allow('', null),
            zipCode: Joi.string().trim().optional().allow('', null),
            roomNumber: Joi.string().trim().optional().allow('', null),
            caseNumber: Joi.string().trim().optional().allow('', null),
            document: Joi.string().optional().allow('', null),
        }).unknown(true),
    },
};
