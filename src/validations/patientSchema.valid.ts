import { Joi, Segments } from 'celebrate';

export const PatientSchema = {
    cancelAgreement: {
        [Segments.BODY]: Joi.object({
            reasonForCancellation: Joi.string().trim().required(),
        }),
    },

    editPatientProfile: {
        [Segments.BODY]: Joi.object({
            firstName: Joi.string().trim(),
            lastName: Joi.string().trim(),
            email: Joi.string().email().trim(),
            dob: Joi.date().iso(),
            phoneNumber: Joi.string().min(11).max(13).messages({
                'string.min': 'Phone number must be a 10 digit number', // Custom message for min length
                'string.max': 'Phone number must not exceed 13 digits', // Custom message for max length
                'string.required': 'Phone number is required', // Custom message for required
            }),
            street: Joi.string().trim(),
            city: Joi.string().trim(),
            state: Joi.string().trim(),
            zipCode: Joi.string().min(5).max(6),
        }),
    },
};
