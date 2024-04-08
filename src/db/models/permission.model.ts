import { Table, Column, Model, BelongsToMany } from 'sequelize-typescript';
import { DataTypes } from 'sequelize';
import {
    PermissionAttributes,
    PermissionCreationAttributes,
} from '../../interfaces';
import { RolePermissionMap, Role } from './index';

@Table({
    timestamps: true,
    paranoid: true,
})
class Permission extends Model<
    PermissionAttributes,
    PermissionCreationAttributes
> {
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
        allowNull: true,
    })
    isDeleted?: boolean;

    @BelongsToMany(
        () => Role,
        () => RolePermissionMap,
        'permissionId',
        'roleId',
    )
    roles: Role[];
}

export default Permission;
