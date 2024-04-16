import { Joi, Segments } from 'celebrate';

export const PatientSchema = {
    cancelAgreement: {
        [Segments.BODY]: Joi.object({
            reasonForCancellation: Joi.string().required(),
        }),
    },

    editPatientProfile: {
        [Segments.BODY]: Joi.object({
            firstName: Joi.string(),
            lastName: Joi.string(),
            email: Joi.string().email(),
            dob: Joi.date().iso(),
            phoneNumber: Joi.string()
                .min(11)
                .max(13),
            street: Joi.string(),
            city: Joi.string(),
            state: Joi.string(),
            zipCode: Joi.string().min(5).max(6),
        }),
    },
};
