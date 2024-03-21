import { Joi, Segments } from 'celebrate';

export const RecordSchema = {
    searchRecord: {
        [Segments.QUERY]: {
            sortBy: Joi.string().valid('id', 'updatedAt', 'acceptedDate'),
            orderBy: Joi.string().valid('ASC', 'DESC'),
            search: Joi.string(),
        },
    },
};
