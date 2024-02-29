import Joi from "joi";

const passRegex =
    "(?=.*[a-z])(?=.*[A-Z])(?=.*d)(?=.*[$@$!#.])[A-Za-zd$@$!%*?&.]{8,20}";

const accountSchema = Joi.object({
    userName: Joi.string().required(),
    password: Joi.string().required().regex(RegExp(passRegex)),
    email: Joi.string().required().email(),
});

export default accountSchema;