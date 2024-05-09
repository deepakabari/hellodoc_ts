import { Joi, Segments } from 'celebrate';

export const InvoicingSchema = {
    addPayRate: {
        [Segments.BODY]: Joi.object({
            physicianId: Joi.number().required(),
            nightShiftWeekend: Joi.number().optional().allow('', null),
            shift: Joi.number().optional().allow('', null),
            houseCallNightWeekend: Joi.number().optional().allow('', null),
            phoneConsult: Joi.number().optional().allow('', null),
            phoneConsultNightWeekend: Joi.number().optional().allow('', null),
            batchTesting: Joi.number().optional().allow('', null),
            houseCall: Joi.number().optional().allow('', null),
        }),
    },

    timesheet: {
        [Segments.BODY]: Joi.object({
            startDate: Joi.string().required(),
        }),
    },

    insertWeeklyRecords: {
        [Segments.BODY]: Joi.object().keys({
            startDate: Joi.date().required(),
            endDate: Joi.date().required(),
            details: Joi.array()
                .items(
                    Joi.object().keys({
                        date: Joi.date().iso().required(),
                        onCallHours: Joi.number()
                            .min(0)
                            .optional()
                            .allow('', null),
                        totalHours: Joi.number()
                            .min(0)
                            .optional()
                            .allow('', null),
                        houseCall: Joi.boolean().optional().allow('', null),
                        phoneConsult: Joi.boolean().optional().allow('', null),
                        item: Joi.string().optional().allow('', null),
                        amount: Joi.number()
                            .precision(2)
                            .optional()
                            .allow('', null),
                        isHoliday: Joi.boolean().optional().allow('', null),
                    }),
                )
                .required(),
        }),
    },
};
