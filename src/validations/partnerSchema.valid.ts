import { Joi, Segments } from 'celebrate'

export const PartnerSchema = {
    sendOrder: {
        [Segments.BODY]: Joi.object({
            prescription: Joi.string().trim().required(),
            noOfRefill: Joi.number().required()
        })
    }
}