import { Joi, Segments } from 'celebrate';
import { AccountType, ProfileStatus } from '../utils/enum.constant';
import linkConstant from '../constants/link.constant';

export const UserSchema = {
    createUser: {
        [Segments.BODY]: Joi.object({
            accountType: Joi.string()
                .required()
                .valid(...Object.values(AccountType)),
            userName: Joi.string().required(),
            password: Joi.string()
                .required()
                .regex(RegExp(linkConstant.PASSWORD_REGEX)),
            confirmPassword: Joi.string().when('accountType', {
                is: 'User',
                then: Joi.valid(Joi.ref('password')).required(),
            }),
            firstName: Joi.string().optional().min(2).allow('', null),
            lastName: Joi.string().allow('', null).optional().min(4),
            email: Joi.string().email().required(),
            confirmEmail: Joi.string()
                .email()
                .when('accountType', {
                    is: 'Admin',
                    then: Joi.valid(Joi.ref('email')).required,
                }),
            phoneNumber: Joi.string()
                .min(11)
                .max(13)
                .optional()
                .allow('', null),
            address1: Joi.string().allow('', null).optional(),
            address2: Joi.string().allow('', null).optional(),
            street: Joi.string().allow('', null).optional(),
            city: Joi.string().optional().allow('', null),
            state: Joi.string().optional().allow('', null),
            zipCode: Joi.string().optional().min(5).max(6).allow('', null),
            dob: Joi.date().allow('', null).optional(),
            status: Joi.string()
                .valid(...Object.values(ProfileStatus))
                .optional(),
            altPhone: Joi.string().optional().min(11).max(13).allow('', null),
            medicalLicense: Joi.string().when('accountType', {
                is: 'Physician',
                then: Joi.required(),
                otherwise: Joi.optional().allow('', null),
            }),
            NPINumber: Joi.string().when('accountType', {
                is: 'Physician',
                then: Joi.required(),
                otherwise: Joi.optional().allow('', null),
            }),
            businessName: Joi.string().when('accountType', {
                is: 'Physician',
                then: Joi.required(),
                otherwise: Joi.optional().allow('', null),
            }),
            businessWebsite: Joi.string()
                .uri()
                .when('accountType', { is: 'Physician', then: Joi.required() }),
            photo: Joi.string().optional().allow('', null),
            signature: Joi.string().optional().allow('', null),
            isAgreementDoc: Joi.boolean().optional(),
            isBackgroundDoc: Joi.boolean().optional(),
            isTrainingDoc: Joi.boolean().optional(),
            isNonDisclosureDoc: Joi.boolean().optional(),
            isLicenseDoc: Joi.boolean().optional(),
            syncEmailAddress: Joi.string().optional().allow('', null),
            regions: Joi.array().items(Joi.number().integer()).optional(),
        }).unknown(true),
    },

    isEmailFound: {
        [Segments.BODY]: Joi.object({
            patientEmail: Joi.string().email().required(),
        }),
    },

    login: {
        [Segments.BODY]: Joi.object({
            email: Joi.string().required().email(),
            password: Joi.string()
                .required()
                .regex(RegExp(linkConstant.PASSWORD_REGEX)),
        }),
    },

    forgotPassword: {
        [Segments.BODY]: Joi.object({
            email: Joi.string().email().required(),
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
            firstName: Joi.string().required(),
            lastName: Joi.string().required(),
            phoneNumber: Joi.string().required().min(11).max(13).messages({
                'string.min': 'Phone number must be a 10 digit number', // Custom message for min length
                'string.max': 'Phone number must not exceed 13 digits', // Custom message for max length
                'string.required': 'Phone number is required', // Custom message for required
            }),
            email: Joi.string().email().required(),
        }),
    },

    requestSupport: {
        [Segments.BODY]: Joi.object({
            message: Joi.string().required(),
        }),
    },

    updateNotification: {
        [Segments.BODY]: Joi.object({
            physicianIds: Joi.array().items(Joi.number().integer()).required(),
        })
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
            firstName: Joi.string(),
            lastName: Joi.string(),
            email: Joi.string().email(),
            phoneNumber: Joi.string().min(11).max(13),
            medicalLicense: Joi.string(),
            NPINumber: Joi.string(),
            syncEmailAddress: Joi.string().email(),
            address1: Joi.string(),
            address2: Joi.string(),
            city: Joi.string(),
            state: Joi.string(),
            zipCode: Joi.string().min(5).max(6),
            altPhone: Joi.string().min(11).max(13),
            photo: Joi.string(),
            signature: Joi.string(),
            businessName: Joi.string(),
            businessWebsite: Joi.string(),
            regions: Joi.array().items(Joi.number().integer()).optional(),
        }),
    },
};
