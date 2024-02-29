import {
    Table,
    Column,
    Model,
    BelongsToMany,
} from "sequelize-typescript";
import { DataTypes } from "sequelize";
import { RoleAttributes, RoleCreationAttributes } from "../../interfaces";
import { User, UserRole } from "./index";

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
    name: string;

    @Column({
        type: DataTypes.STRING,
        allowNull: false,
    })
    accountType: string;

    @Column({
        type: DataTypes.DATE,
        allowNull: false,
    })
    isDeleted: boolean;

    @BelongsToMany(() => User, () => UserRole, "roleId", "userId")
    users: User[];
}

export default Role;
