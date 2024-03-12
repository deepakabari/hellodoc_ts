import { Table, Column, Model, BelongsToMany } from "sequelize-typescript";
import { DataTypes } from "sequelize";
import { RoleAttributes, RoleCreationAttributes } from "../../interfaces";
import { User, UserRole } from "./index";
import { Joi, Segments } from "celebrate";

@Table({
    timestamps: true,
    paranoid: true,
})
class Role extends Model<RoleAttributes, RoleCreationAttributes> {
    @Column({
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
    })
    id: number;

    @Column({
        type: DataTypes.STRING,
        allowNull: false,
    })
    Name: string;

    @Column({
        type: DataTypes.STRING,
        allowNull: false,
    })
    accountType: string;

    @Column({
        type: DataTypes.DATE,
        allowNull: true,
    })
    isDeleted: boolean;

    @BelongsToMany(() => User, () => UserRole, "roleId", "userId")
    users: User[];
}

export { Role };

export const RoleSchema = {
    createRole: {
        [Segments.BODY]: Joi.object({
            roleName: Joi.string().required(),
            accountType: Joi.string().required(),
        }),
    },

    userAccess: {
        [Segments.QUERY]: {
            accountType: Joi.string().valid("Admin", "Physician", "User").required().insensitive(),
        }
    }
};
