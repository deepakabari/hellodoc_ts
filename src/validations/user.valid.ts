import Joi from "joi";

const passRegex =
    "^(?=.*[!@#$%^&*(),.?:{}|<>])(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9]).{8,16}$";

const userSchema = Joi.object({
    userName: Joi.string().required(),
    password: Joi.string().required().regex(RegExp(passRegex)),
    firstName: Joi.string().required(),
    lastName: Joi.string().optional(),
    email: Joi.string().email(),
    phoneNumber: Joi.string().min(10).max(10).required(),
    address1: Joi.string().optional(),
    address2: Joi.string().optional(),
    street: Joi.string().optional(),
    city: Joi.string().required(),
    state: Joi.string().required(),
    zipCode: Joi.string().required(),
    dob: Joi.date().optional(),
    status: Joi.string().optional(),
    altPhone: Joi.string().optional().min(10).max(10),
    medicalLicense: Joi.string().optional(),
    photo: Joi.string().optional(),
    signature: Joi.string().optional(),
    isAgreementDoc: Joi.boolean().optional(),
    isBackgroundDoc: Joi.boolean().optional(),
    isTrainingDoc: Joi.boolean().optional(),
    isNonDisclosureDoc: Joi.boolean().optional(),
    isLicenseDoc: Joi.boolean().optional(),
    NPINumber: Joi.string().optional(),
    syncEmailAddress: Joi.string().optional(),
}).unknown(true);

export { userSchema };
