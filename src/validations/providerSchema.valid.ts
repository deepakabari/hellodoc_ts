import { Joi, Segments } from 'celebrate';

export const ProviderSchema = {
    contactProvider: {
        [Segments.PARAMS]: {
            id: Joi.number().required(),
        },
        [Segments.BODY]: {
            messageBody: Joi.string().required(),
            contactMethod: Joi.string()
                .valid('sms', 'email', 'both')
                .required(),
        },
    },

    updateNotification: {
        [Segments.BODY]: Joi.object({
            physicianIds: Joi.array()
                .items(Joi.number().required())
                .min(1)
                .required(),
        }),
    },

    updateNotes: {
        [Segments.BODY]: Joi.object({
            physicianNotes: Joi.string().required(),
        }),
        [Segments.PARAMS]: {
            id: Joi.number().required(),
        },
    },

    concludeCare: {
        [Segments.BODY]: Joi.object({
            providerNotes: Joi.string().required(),
        }),
    },

    typeOfCare: {
        [Segments.BODY]: Joi.object({
            typeOfCare: Joi.string().required(),
        }),
    },

    transferRequest: {
        [Segments.BODY]: Joi.object({
            description: Joi.string().required(),
        }),
    },

    myProfile: {
        [Segments.BODY]: Joi.object({
            message: Joi.string().required(),
        }),
    },

    encounterForm: {
        [Segments.BODY]: Joi.object({
            serviceDate: Joi.date(),
            presentIllnessHistory: Joi.string(),
            medicalHistory: Joi.string(),
            medications: Joi.string(),
            allergies: Joi.string(),
            temperature: Joi.number(),
            heartRate: Joi.number(),
            repositoryRate: Joi.number(),
            sisBP: Joi.number(),
            diaBP: Joi.number(),
            oxygen: Joi.number(),
            pain: Joi.string(),
            heent: Joi.string(),
            cv: Joi.string(),
            chest: Joi.string(),
            abd: Joi.string(),
            extr: Joi.string(),
            skin: Joi.string(),
            neuro: Joi.string(),
            other: Joi.string(),
            diagnosis: Joi.string(),
            treatmentPlan: Joi.string(),
            medicationDispensed: Joi.string(),
            procedure: Joi.string(),
            followUp: Joi.string(),
        }),
    },
};
