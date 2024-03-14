import { Joi, Segments } from "celebrate";

export const RoleSchema = {
    createRole: {
        [Segments.BODY]: Joi.object({
            roleName: Joi.string().required(),
            accountType: Joi.string().required(),
        }),
    },

    userAccess: {
        [Segments.QUERY]: {
            accountType: Joi.string().valid("Admin", "Physician", "User", "All").required().insensitive().default("All"),
        }
    }
};