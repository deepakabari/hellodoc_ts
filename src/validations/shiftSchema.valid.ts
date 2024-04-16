import { Joi, Segments } from 'celebrate';

export const ShiftSchema = {
    createShift: {
        [Segments.BODY]: Joi.object({
            region: Joi.string().required(),
            physicianId: Joi.required(),
            shiftDate: Joi.date().required(),
            startTime: Joi.string().required(),
            endTime: Joi.string().required(),
            isRepeat: Joi.boolean().optional().allow('', null),
            repeatUpto: Joi.number().optional(),
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
            shiftDate: Joi.date(),
            startTime: Joi.string(),
            endTime: Joi.string(),
        }),
    },
};
