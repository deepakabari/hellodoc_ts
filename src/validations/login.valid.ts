import Joi from "joi";

const passRegex =
    "^(?=.*[!@#$%^&*(),.?:{}|<>])(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9]).{8,16}$";

const loginSchema = Joi.object({
    email: Joi.string().required().email(),
    password: Joi.string().required().regex(RegExp(passRegex)),
});

export { loginSchema };
