import { Joi, Segments } from 'celebrate';

export const BusinessSchema = {
    createBusiness: {
        [Segments.BODY]: Joi.object({
            businessName: Joi.string().required(),
            businessWebsite: Joi.string().required(),
            profession: Joi.string().required(),
            faxNumber: Joi.string().required(),
            phoneNumber: Joi.string().required().min(10).max(10),
            email: Joi.string().email().required(),
            businessContact: Joi.string().required(),
            street: Joi.string().required(),
            city: Joi.string().required(),
            state: Joi.string().required(),
            zipCode: Joi.string().min(5).max(6).required(),
        }),
    },
};
