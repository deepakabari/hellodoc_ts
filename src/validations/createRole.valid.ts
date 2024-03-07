import Joi from "joi";

const roleSchema = Joi.object({
    roleName: Joi.string().required(),
    accountType: Joi.string().required(),
});

export { roleSchema };
