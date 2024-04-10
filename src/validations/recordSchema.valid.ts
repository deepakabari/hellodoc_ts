import { Joi, Segments } from 'celebrate';

export const RecordSchema = {
    searchRecord: {
        [Segments.QUERY]: {
            sortBy: Joi.string().valid('id', 'updatedAt', 'acceptedDate'),
            orderBy: Joi.string().valid('ASC', 'DESC'),
            fromDate: Joi.string(),
            toDate: Joi.string(),
            requestStatus: Joi.string(),
            patientName: Joi.string(),
            requestType: Joi.string(),
            email: Joi.string(),
            phoneNumber: Joi.string(),
            physicianName: Joi.string(),
            page: Joi.string(),
            pageSize: Joi.string(),
        },
    },
};
