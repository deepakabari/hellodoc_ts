import Joi from "joi";

const passRegex =
    "(?=.*[a-z])(?=.*[A-Z])(?=.*d)(?=.*[$@$!#.])[A-Za-zd$@$!%*?&.]{8,20}";

const resetSchema = Joi.object({
    newPassword: Joi.string().required().regex(RegExp(passRegex)),
    confirmPassword: Joi.string().required().regex(RegExp(passRegex)),
});

export { resetSchema };
