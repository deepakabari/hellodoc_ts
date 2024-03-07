import Joi from 'joi';

const cancelCaseSchema = Joi.object({
    adminNotes: Joi.string().required(),
    reasonForCancellation: Joi.string().required()
})

export { cancelCaseSchema }