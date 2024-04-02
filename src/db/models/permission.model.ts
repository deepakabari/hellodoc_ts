import { Table, Column, Model } from 'sequelize-typescript';
import { DataTypes } from 'sequelize';
import { PermissionAttributes, PermissionCreationAttributes } from '../../interfaces';

@Table({
    timestamps: true,
    paranoid: true,
})
class Permission extends Model<PermissionAttributes, PermissionCreationAttributes> {
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
    isDeleted: boolean;
}

export default Permission;
