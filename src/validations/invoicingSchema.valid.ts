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
};
