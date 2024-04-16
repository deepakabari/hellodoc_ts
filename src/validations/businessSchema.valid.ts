import { Joi, Segments } from 'celebrate';

export const BusinessSchema = {
    createBusiness: {
        [Segments.BODY]: Joi.object({
            businessName: Joi.string().required(),
            profession: Joi.string().required(),
            faxNumber: Joi.string().optional().allow('', null),
            phoneNumber: Joi.string().required().min(11).max(13).messages({
                'string.min': 'Phone number must be a 10 digit number', // Custom message for min length
                'string.max': 'Phone number must not exceed 13 digits', // Custom message for max length
                'string.required': 'Phone number is required', // Custom message for required
            }),
            email: Joi.string().email().required(),
            businessContact: Joi.string().optional().allow('', null),
            street: Joi.string().required(),
            city: Joi.string().required(),
            state: Joi.string().required(),
            zipCode: Joi.string().min(5).max(6).required(),
        }),
    },

    updateBusiness: {
        [Segments.BODY]: Joi.object({
            businessName: Joi.string(),
            profession: Joi.string(),
            faxNumber: Joi.string(),
            phoneNumber: Joi.string().min(11).max(13).messages({
                'string.min': 'Phone number must be a 10 digit number', // Custom message for min length
                'string.max': 'Phone number must not exceed 13 digits', // Custom message for max length
                'string.required': 'Phone number is required', // Custom message for required
            }),
            email: Joi.string().email(),
            businessContact: Joi.string(),
            street: Joi.string(),
            city: Joi.string(),
            state: Joi.string(),
            zipCode: Joi.string().min(5).max(6),
        }),
    },
};
