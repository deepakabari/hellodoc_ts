import { Table, Column, Model } from 'sequelize-typescript';
import { DataTypes } from 'sequelize';
import { UserRoleAttributes } from '../../interfaces';

@Table({
    timestamps: true,
    paranoid: true,
    indexes: [
        {
            unique: true,
            fields: ['userId', 'roleId'],
        },
    ],
})
class UserRole extends Model<UserRoleAttributes> {
    @Column({ type: DataTypes.INTEGER, allowNull: false })
    userId: number;

    @Column({ type: DataTypes.INTEGER, allowNull: false })
    roleId: number;
}
export default UserRole;
