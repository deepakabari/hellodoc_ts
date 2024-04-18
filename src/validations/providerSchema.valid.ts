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
            serviceDate: Joi.date().required(),
            presentIllnessHistory: Joi.string().optional().allow('', null),
            medicalHistory: Joi.string().optional().allow('', null),
            medications: Joi.string().optional().allow('', null),
            allergies: Joi.string().optional().allow('', null),
            temperature: Joi.number().optional().allow('', null),
            heartRate: Joi.number().optional().allow('', null),
            repositoryRate: Joi.number().optional().allow('', null),
            sisBP: Joi.number().optional().allow('', null),
            diaBP: Joi.number().optional().allow('', null),
            oxygen: Joi.number().optional().allow('', null),
            pain: Joi.string().optional().allow('', null),
            heent: Joi.string().optional().allow('', null),
            cv: Joi.string().optional().allow('', null),
            chest: Joi.string().optional().allow('', null),
            abd: Joi.string().optional().allow('', null),
            extr: Joi.string().optional().allow('', null),
            skin: Joi.string().optional().allow('', null),
            neuro: Joi.string().optional().allow('', null),
            other: Joi.string().optional().allow('', null),
            diagnosis: Joi.string().optional().allow('', null),
            treatmentPlan: Joi.string().optional().allow('', null),
            medicationDispensed: Joi.string().optional().allow('', null),
            procedure: Joi.string().optional().allow('', null),
            followUp: Joi.string().optional().allow('', null),
        }),
    },
};
