import Joi from "joi";

const passRegex =
    "(?=.*[a-z])(?=.*[A-Z])(?=.*d)(?=.*[$@$!#.])[A-Za-zd$@$!%*?&.]{8,20}";

const requestSchema = Joi.object({
    patientFirstName: Joi.string().required(),
    patientLastName: Joi.string().required(),
    patientEmail: Joi.string().required(),
    patientPhoneNumber: Joi.string().required(),
    requestorFirstName: Joi.string().optional(),
    requestorLastName: Joi.string().optional(),
    requestorPhoneNumber: Joi.string().optional(),
    requestorEmail: Joi.string().optional(),
    password: Joi.string().required().regex(RegExp(passRegex)),
    relationName: Joi.string().optional(),
    street: Joi.string().required(),
    dob: Joi.date().required(),
    city: Joi.string().required(),
    state: Joi.string().required(),
    zipCode: Joi.string().required(),
    roomNumber: Joi.string().optional(),
    documentPhoto: Joi.string().optional()
}).unknown(true);
export default requestSchema;
