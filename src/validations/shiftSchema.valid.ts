import { Joi, Segments } from 'celebrate';

export const ShiftSchema = {
    createShift: {
        [Segments.BODY]: Joi.object({
            region: Joi.string().required(),
            physicianId: Joi.required(),
            shiftDate: Joi.date().required(),
            startTime: Joi.string().required(),
            endTime: Joi.string().required(),
            isRepeat: Joi.boolean().optional(),
            weekDays: Joi.string().optional(),
            repeatUpto: Joi.number().optional(),
        })
    }
};
