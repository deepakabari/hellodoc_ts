import { Table, Column, Model, BelongsTo } from 'sequelize-typescript';
import { DataTypes, Sequelize } from 'sequelize';
import { ShiftAttributes, ShiftCreationAttributes } from '../../interfaces';
import { User } from './index';

@Table({
    timestamps: true,
    paranoid: true,
})
class Shift extends Model<ShiftAttributes, ShiftCreationAttributes> {
    @Column({
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
    })
    id: number;

    @Column({
        type: DataTypes.INTEGER,
        allowNull: false,
    })
    physicianId: number;

    @Column({
        type: DataTypes.DATEONLY,
        allowNull: false,
    })
    shiftDate: Date;

    @Column({
        type: DataTypes.STRING,
        allowNull: false,
    })
    region: string;

    @Column({
        type: DataTypes.STRING,
        allowNull: true,
    })
    startTime: string;

    @Column({
        type: DataTypes.STRING,
        allowNull: true,
    })
    endTime: string;

    @Column({
        type: DataTypes.BOOLEAN,
        allowNull: true,
    })
    isRepeat: boolean;

    @Column({
        type: DataTypes.INTEGER,
        allowNull: true,
    })
    repeatUpto: number;

    @Column({
        type: DataTypes.BOOLEAN,
        allowNull: true,
    })
    sunday: boolean;

    @Column({
        type: DataTypes.BOOLEAN,
        allowNull: true,
    })
    monday: boolean;

    @Column({
        type: DataTypes.BOOLEAN,
        allowNull: true,
    })
    tuesday: boolean;

    @Column({
        type: DataTypes.BOOLEAN,
        allowNull: true,
    })
    wednesday: boolean;

    @Column({
        type: DataTypes.BOOLEAN,
        allowNull: true,
    })
    thursday: boolean;

    @Column({
        type: DataTypes.BOOLEAN,
        allowNull: true,
    })
    friday: boolean;

    @Column({
        type: DataTypes.BOOLEAN,
        allowNull: true,
    })
    saturday: boolean;

    @Column({
        type: DataTypes.BOOLEAN,
        allowNull: true,
    })
    isApproved: boolean;

    @Column({
        type: DataTypes.BOOLEAN,
        allowNull: true,
    })
    isDeleted: boolean;

    @BelongsTo(() => User, {
        foreignKey: 'physicianId',
        targetKey: 'id',
        as: 'physician',
    })
    physician: User;
}
export default Shift;
