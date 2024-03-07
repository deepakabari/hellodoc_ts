import Joi from "joi";

const passRegex =
    "^(?=.*[!@#$%^&*(),.?:{}|<>])(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9]).{8,16}$";

const resetSchema = Joi.object({
    newPassword: Joi.string().required().regex(RegExp(passRegex)),
    confirmPassword: Joi.string().required().regex(RegExp(passRegex)),
});

export { resetSchema };
