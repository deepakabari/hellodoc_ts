import { Joi, Segments } from 'celebrate';
import { AccountType, ProfileStatus } from '../utils/enum.constant';
import linkConstant from '../constants/link.constant';

export const UserSchema = {
    createUser: {
        [Segments.BODY]: Joi.object({
            accountType: Joi.string()
                .required()
                .valid(...Object.values(AccountType)),
            userName: Joi.string().trim().required(),
            password: Joi.string()
                .required()
                .regex(RegExp(linkConstant.PASSWORD_REGEX)),
            firstName: Joi.string().trim().optional().min(2).allow('', null),
            lastName: Joi.string().trim().allow('', null).optional().min(4),
            email: Joi.string().trim().email().required(),
            confirmEmail: Joi.string()
                .email()
                .when('accountType', {
                    is: 'Admin',
                    then: Joi.valid(Joi.ref('email')).required,
                }),
            phoneNumber: Joi.string().min(11).max(13).messages({
                'string.min': 'Phone number must be a 10 digit number', // Custom message for min length
                'string.max': 'Phone number must not exceed 13 digits', // Custom message for max length
                'string.required': 'Phone number is required', // Custom message for required
            }),
            address1: Joi.string().trim().allow('', null).optional(),
            address2: Joi.string().trim().allow('', null).optional(),
            street: Joi.string().trim().allow('', null).optional(),
            city: Joi.string().trim().optional().allow('', null),
            state: Joi.string().trim().optional().allow('', null),
            zipCode: Joi.string().optional().min(5).max(6).allow('', null),
            dob: Joi.date().allow('', null).optional(),
            status: Joi.string()
                .valid(...Object.values(ProfileStatus))
                .optional(),
            altPhone: Joi.string().min(11).max(13).messages({
                'string.min': 'Phone number must be a 10 digit number', // Custom message for min length
                'string.max': 'Phone number must not exceed 13 digits', // Custom message for max length
                'string.required': 'Phone number is required', // Custom message for required
            }),
            medicalLicense: Joi.string().trim().when('accountType', {
                is: 'Physician',
                then: Joi.required(),
                otherwise: Joi.optional().allow('', null),
            }),
            NPINumber: Joi.string().trim().when('accountType', {
                is: 'Physician',
                then: Joi.required(),
                otherwise: Joi.optional().allow('', null),
            }),
            businessName: Joi.string().trim().when('accountType', {
                is: 'Physician',
                then: Joi.required(),
                otherwise: Joi.optional().allow('', null),
            }),
            businessWebsite: Joi.string().trim()
                .uri()
                .when('accountType', { is: 'Physician', then: Joi.required() }),
            photo: Joi.string().optional().allow('', null),
            signature: Joi.string().optional().allow('', null),
            isAgreementDoc: Joi.boolean().optional(),
            isBackgroundDoc: Joi.boolean().optional(),
            isTrainingDoc: Joi.boolean().optional(),
            isNonDisclosureDoc: Joi.boolean().optional(),
            isLicenseDoc: Joi.boolean().optional(),
            syncEmailAddress: Joi.string().trim().optional().allow('', null),
            regions: Joi.array().items(Joi.number().integer()).optional(),
        }).unknown(true),
    },

    createPatient: {
        [Segments.BODY]: Joi.object({
            email: Joi.string().email().trim().required(),
            password: Joi.string()
                .regex(RegExp(linkConstant.PASSWORD_REGEX))
                .required(),
            confirmPassword: Joi.string().valid(Joi.ref('password')).required(),
        }),
    },

    isEmailFound: {
        [Segments.BODY]: Joi.object({
            patientEmail: Joi.string().email().trim().required(),
        }),
    },

    login: {
        [Segments.BODY]: Joi.object({
            email: Joi.string().required().trim().email(),
            password: Joi.string()
                .required()
                .regex(RegExp(linkConstant.PASSWORD_REGEX)),
        }),
    },

    forgotPassword: {
        [Segments.BODY]: Joi.object({
            email: Joi.string().email().trim().required(),
        }),
    },

    resetPassword: {
        [Segments.BODY]: Joi.object({
            newPassword: Joi.string()
                .required()
                .regex(RegExp(linkConstant.PASSWORD_REGEX)),
            confirmPassword: Joi.string()
                .required()
                .regex(RegExp(linkConstant.PASSWORD_REGEX)),
        }),
        [Segments.PARAMS]: {
            hash: Joi.string().required(),
        },
    },

    changePassword: {
        [Segments.BODY]: Joi.object({
            password: Joi.string()
                .required()
                .regex(RegExp(linkConstant.PASSWORD_REGEX)),
        }),
    },

    sendPatientRequest: {
        [Segments.BODY]: Joi.object({
            firstName: Joi.string().trim().required(),
            lastName: Joi.string().trim().required(),
            phoneNumber: Joi.string().required().min(11).max(13).messages({
                'string.min': 'Phone number must be a 10 digit number', // Custom message for min length
                'string.max': 'Phone number must not exceed 13 digits', // Custom message for max length
                'string.required': 'Phone number is required', // Custom message for required
            }),
            email: Joi.string().email().trim().required(),
        }),
    },

    requestSupport: {
        [Segments.BODY]: Joi.object({
            message: Joi.string().trim().required(),
        }),
    },

    editPhysicianProfile: {
        [Segments.PARAMS]: {
            id: Joi.string().required(),
        },
        [Segments.BODY]: Joi.object({
            password: Joi.string()
                .regex(RegExp(linkConstant.PASSWORD_REGEX))
                .optional(),
            status: Joi.string().valid(...Object.values(ProfileStatus)),
            firstName: Joi.string().trim(),
            lastName: Joi.string().trim(),
            email: Joi.string().email().trim(),
            phoneNumber: Joi.string().min(11).max(13).messages({
                'string.min': 'Phone number must be a 10 digit number', // Custom message for min length
                'string.max': 'Phone number must not exceed 13 digits', // Custom message for max length
                'string.required': 'Phone number is required', // Custom message for required
            }),
            medicalLicense: Joi.string().trim(),
            NPINumber: Joi.string().trim(),
            syncEmailAddress: Joi.string().email().trim(),
            address1: Joi.string().trim(),
            address2: Joi.string().trim(),
            city: Joi.string().trim(),
            state: Joi.string().trim(),
            zipCode: Joi.string().min(5).max(6),
            altPhone: Joi.string().min(11).max(13).messages({
                'string.min': 'Phone number must be a 10 digit number', // Custom message for min length
                'string.max': 'Phone number must not exceed 13 digits', // Custom message for max length
                'string.required': 'Phone number is required', // Custom message for required
            }),
            photo: Joi.string(),
            signature: Joi.string(),
            businessName: Joi.string().trim(),
            businessWebsite: Joi.string().trim(),
            roleId: Joi.string().allow('', null).optional(),
            regions: Joi.array().items(Joi.number().integer()).optional(),
        }).unknown(true),
    },
};
