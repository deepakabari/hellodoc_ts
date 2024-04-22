import { Joi, Segments } from 'celebrate';

export const BusinessSchema = {
    createBusiness: {
        [Segments.BODY]: Joi.object({
            businessName: Joi.string().trim().required(),
            profession: Joi.string().required(),
            faxNumber: Joi.string().trim().optional().allow('', null),
            phoneNumber: Joi.string().required().min(11).max(13).messages({
                'string.min': 'Phone number must be a 10 digit number', // Custom message for min length
                'string.max': 'Phone number must not exceed 13 digits', // Custom message for max length
                'string.required': 'Phone number is required', // Custom message for required
            }),
            email: Joi.string().email().trim().required(),
            businessContact: Joi.string().trim().optional().allow('', null),
            street: Joi.string().trim().required(),
            city: Joi.string().trim().required(),
            state: Joi.string().trim().required(),
            zipCode: Joi.string().min(5).max(6).required(),
        }),
    },

    updateBusiness: {
        [Segments.BODY]: Joi.object({
            businessName: Joi.string().trim(),
            profession: Joi.string(),
            faxNumber: Joi.string().trim(),
            phoneNumber: Joi.string().min(11).max(13).messages({
                'string.min': 'Phone number must be a 10 digit number', // Custom message for min length
                'string.max': 'Phone number must not exceed 13 digits', // Custom message for max length
                'string.required': 'Phone number is required', // Custom message for required
            }),
            email: Joi.string().email().trim(),
            businessContact: Joi.string().trim(),
            street: Joi.string().trim(),
            city: Joi.string().trim(),
            state: Joi.string().trim(),
            zipCode: Joi.string().min(5).max(6),
        }),
    },
};
