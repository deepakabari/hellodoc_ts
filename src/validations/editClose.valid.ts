import Joi from "joi";

const editCloseSchema = Joi.object({
    patientPhoneNumber: Joi.string().required().min(10).max(10),
    patientEmail: Joi.string().required().email(),
});

export { editCloseSchema };