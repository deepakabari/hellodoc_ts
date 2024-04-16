import { Joi, Segments } from 'celebrate';

export const BusinessSchema = {
    createBusiness: {
        [Segments.BODY]: Joi.object({
            businessName: Joi.string().required(),
            profession: Joi.string().optional(),
            faxNumber: Joi.string().optional(),
            phoneNumber: Joi.string().required().min(11).max(13),
            email: Joi.string().email().required(),
            businessContact: Joi.string().optional(),
            street: Joi.string().required(),
            city: Joi.string().required(),
            state: Joi.string().required(),
            zipCode: Joi.string().min(5).max(6).required(),
        }),
    },
};
