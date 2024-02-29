import { Table, Column, Model, ForeignKey } from "sequelize-typescript";
import { DataTypes } from "sequelize";
import { User, Role } from "./index";

@Table
class UserRole extends Model {
    @ForeignKey(() => User)
    @Column({ type: DataTypes.INTEGER, allowNull: false })
    userId: number;

    @ForeignKey(() => Role)
    @Column({ type: DataTypes.INTEGER, allowNull: false })
    roleId: number;
}
export default UserRole;
