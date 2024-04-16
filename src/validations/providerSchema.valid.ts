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
            message: Joi.string().required()
        })
    }
};
