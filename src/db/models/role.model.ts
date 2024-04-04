import {
    Table,
    Column,
    Model,
    BelongsToMany,
    BelongsTo,
    HasMany,
} from 'sequelize-typescript';
import { DataTypes } from 'sequelize';
import { RoleAttributes, RoleCreationAttributes } from '../../interfaces';
import { Permission, RolePermissionMap, User } from './index';

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

    @HasMany(() => User, {
        foreignKey: 'roleId',
        as: 'users',
    })
    users: User[];

    @BelongsToMany(
        () => Permission,
        () => RolePermissionMap,
        'permissionId',
        'roleId',
    )
    permission: Permission[];
}

export default Role;
