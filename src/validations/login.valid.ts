import Joi from 'joi';

const passRegex =
    "(?=.*[a-z])(?=.*[A-Z])(?=.*d)(?=.*[$@$!#.])[A-Za-zd$@$!%*?&.]{8,20}";

const loginSchema = Joi.object({
    email: Joi.string().required().email(),
    password: Joi.string().required().regex(RegExp(passRegex))
})

export default loginSchema