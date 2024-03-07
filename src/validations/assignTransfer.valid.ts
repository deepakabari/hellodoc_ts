import Joi from "joi";

const assignSchema = Joi.object({
    transferNote: Joi.string().required(),
});
export { assignSchema };
