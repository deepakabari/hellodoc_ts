import { Table, Column, Model } from 'sequelize-typescript';
import { DataTypes } from 'sequelize';
import { RolePermissionMapAttributes } from '../../interfaces';

@Table({
    timestamps: true,
    paranoid: true,
})
class RolePermissionMap extends Model<RolePermissionMapAttributes> {
    @Column({
        type: DataTypes.INTEGER,
        allowNull: false,
    })
    roleId: number;

    @Column({
        type: DataTypes.INTEGER,
        allowNull: false,
    })
    permissionId: number;
}
export default RolePermissionMap;
