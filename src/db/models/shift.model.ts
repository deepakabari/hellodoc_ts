import { Table, Column, Model, BelongsTo } from 'sequelize-typescript';
import { DataTypes } from 'sequelize';
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
        type: DataTypes.TIME,
        allowNull: true,
    })
    startTime: string;

    @Column({
        type: DataTypes.TIME,
        allowNull: true,
    })
    endTime: string;

    @Column({
        type: DataTypes.BOOLEAN,
        allowNull: true,
    })
    isRepeat: boolean;

    @Column({
        type: DataTypes.STRING,
        allowNull: true,
    })
    weekDays: string;

    @Column({
        type: DataTypes.INTEGER,
        allowNull: true,
    })
    repeatUpto: number;

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
