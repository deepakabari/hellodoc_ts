import { Joi, Segments } from 'celebrate';
import { AccountType } from '../utils/enum.constant';

export const RoleSchema = {
    createRole: {
        [Segments.BODY]: Joi.object({
            roleName: Joi.string().trim().required(),
            accountType: Joi.string()
                .required()
                .valid(...Object.values(AccountType)),
            permissionIds: Joi.array().items(Joi.number()).required(),
        }),
    },

    accountAccessByAccountType: {
        [Segments.QUERY]: {
            accountTypes: Joi.string()
                .required()
                .valid(...Object.values(AccountType)),
        },
    },
};
