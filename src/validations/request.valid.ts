import Joi from "joi";

const passRegex =
    "^(?=.*[!@#$%^&*(),.?:{}|<>])(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9]).{8,16}$";

const requestSchema = Joi.object({
    patientFirstName: Joi.string().required(),
    patientLastName: Joi.string().required(),
    patientEmail: Joi.string().required().email(),
    patientPhoneNumber: Joi.string().required().min(10).max(10),
    requestorFirstName: Joi.string().optional(),
    requestorLastName: Joi.string().optional(),
    requestorPhoneNumber: Joi.string().optional().min(10).max(10),
    requestorEmail: Joi.string().optional().email(),
    password: Joi.string().required().regex(RegExp(passRegex)),
    relationName: Joi.string().optional(),
    street: Joi.string().required(),
    dob: Joi.date().required(),
    city: Joi.string().required(),
    state: Joi.string().required(),
    zipCode: Joi.string().required(),
    roomNumber: Joi.string().optional(),
    documentPhoto: Joi.string().optional(),
}).unknown(true);

export { requestSchema };
