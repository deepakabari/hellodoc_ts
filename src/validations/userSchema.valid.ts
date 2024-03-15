import { Joi, Segments } from "celebrate";
import { AccountType, ProfileStatus } from "../utils/enum.constant"

export const UserSchema = {
    createUser: {
        [Segments.BODY]: Joi.object({
            accountType: Joi.string().required().valid(...Object.values(AccountType)),
            userName: Joi.string().required(),
            password: Joi.string()
                .required()
                .regex(
                    RegExp(
                        "^(?=.*[!@#$%^&*(),.?:{}|<>])(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9]).{8,16}$"
                    )
                ),
            firstName: Joi.string().required().min(2),
            lastName: Joi.string().allow("", null).optional().min(4),
            email: Joi.string().email().required(),
            phoneNumber: Joi.string().min(10).max(10).required(),
            address1: Joi.string().allow("", null).optional(),
            address2: Joi.string().allow("", null).optional(),
            street: Joi.string().allow("", null).optional(),
            city: Joi.string().required(),
            state: Joi.string().required(),
            zipCode: Joi.string().required().min(5).max(6),
            dob: Joi.date().allow("", null).optional(),
            status: Joi.string().valid(...Object.values(ProfileStatus)).optional(),
            altPhone: Joi.string().optional().min(10).max(10).allow("", null),
            medicalLicense: Joi.string().optional().allow("", null),
            photo: Joi.string().optional().allow("", null),
            signature: Joi.string().optional().allow("", null),
            isAgreementDoc: Joi.boolean().optional(),
            isBackgroundDoc: Joi.boolean().optional(),
            isTrainingDoc: Joi.boolean().optional(),
            isNonDisclosureDoc: Joi.boolean().optional(),
            isLicenseDoc: Joi.boolean().optional(),
            NPINumber: Joi.string().optional().allow("", null),
            syncEmailAddress: Joi.string().optional().allow("", null),
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
                .regex(
                    RegExp(
                        "^(?=.*[!@#$%^&*(),.?:{}|<>])(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9]).{8,16}$"
                    )
                ),
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
                .regex(
                    RegExp(
                        "^(?=.*[!@#$%^&*(),.?:{}|<>])(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9]).{8,16}$"
                    )
                ),
            confirmPassword: Joi.string()
                .required()
                .regex(
                    RegExp(
                        "^(?=.*[!@#$%^&*(),.?:{}|<>])(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9]).{8,16}$"
                    )
                ),
        }),
        [Segments.PARAMS]: {
            hash: Joi.string().required(),
        },
    },

    sendPatientRequest: {
        [Segments.BODY]: Joi.object({
            firstName: Joi.string().required(),
            lastName: Joi.string().required(),
            phoneNumber: Joi.string().required().min(10).max(10),
            email: Joi.string().email().required(),
        }),
    },

    requestSupport: {
        [Segments.BODY]: Joi.object({
            message: Joi.string().required(),
        }),
    },
};