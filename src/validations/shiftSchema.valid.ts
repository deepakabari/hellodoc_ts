import { Joi, Segments } from 'celebrate';

const today = new Date();
today.setHours(0, 0, 0, 0);

export const ShiftSchema = {
    createShift: {
        [Segments.BODY]: Joi.object({
            accountType: Joi.string().valid('Admin', 'Physician').required(),
            region: Joi.string().required(),
            physicianId: Joi.optional().allow('', null),
            shiftDate: Joi.date().required().min(today),
            startTime: Joi.string().required(),
            endTime: Joi.string().required(),
            isRepeat: Joi.boolean().optional().allow('', null),
            repeatUpto: Joi.number().optional().allow('', null),
            sunday: Joi.boolean().optional().allow('', null),
            monday: Joi.boolean().optional().allow('', null),
            tuesday: Joi.boolean().optional().allow('', null),
            wednesday: Joi.boolean().optional().allow('', null),
            thursday: Joi.boolean().optional().allow('', null),
            friday: Joi.boolean().optional().allow('', null),
            saturday: Joi.boolean().optional().allow('', null),
        }),
    },

    approveShift: {
        [Segments.BODY]: Joi.object({
            shiftIds: Joi.array()
                .items(Joi.number().required())
                .min(1)
                .required(),
        }),
    },

    editShift: {
        [Segments.BODY]: Joi.object({
            shiftDate: Joi.date().min(today),
            startTime: Joi.string(),
            endTime: Joi.string(),
        }),
    },
};
