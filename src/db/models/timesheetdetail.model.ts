import { BelongsTo, Column, Model, Table } from 'sequelize-typescript';
import {
    TimesheetDetailAttributes,
    TimesheetDetailCreationAttributes,
} from '../../interfaces';
import { DataTypes } from 'sequelize';
import { WeeklyTimesheet } from './index';

@Table({
    timestamps: true,
    paranoid: true,
})
class TimesheetDetail extends Model<
    TimesheetDetailAttributes,
    TimesheetDetailCreationAttributes
> {
    @Column({
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
    })
    id: number;

    @Column({ type: DataTypes.INTEGER, allowNull: false })
    timesheetId: number;

    @Column({ type: DataTypes.DATEONLY, allowNull: false })
    date: Date;

    @Column({ type: DataTypes.INTEGER, allowNull: true })
    onCallHours: number;

    @Column({ type: DataTypes.INTEGER, allowNull: true })
    totalHours: number;

    @Column({ type: DataTypes.INTEGER, allowNull: true })
    houseCall: number;

    @Column({ type: DataTypes.INTEGER, allowNull: true })
    phoneConsult: number;

    @Column({ type: DataTypes.STRING, allowNull: true })
    item: string;

    @Column({ type: DataTypes.INTEGER, allowNull: true })
    amount: number;

    @Column({ type: DataTypes.STRING, allowNull: true })
    bill: string;

    @Column({ type: DataTypes.BOOLEAN, allowNull: true })
    isHoliday: boolean;

    @Column({ type: DataTypes.INTEGER, allowNull: true })
    numberOfShifts: number;

    @Column({ type: DataTypes.INTEGER, allowNull: true })
    nightShiftWeekend: number;

    @Column({ type: DataTypes.INTEGER, allowNull: true })
    phoneConsultNightWeekend: number;

    @Column({ type: DataTypes.INTEGER, allowNull: true })
    houseCallNightWeekend: number;

    @Column({ type: DataTypes.INTEGER, allowNull: true })
    batchTesting: number;

    @Column({ type: DataTypes.INTEGER, allowNull: true })
    totalAmount: number;

    @Column({ type: DataTypes.INTEGER, allowNull: true })
    bonusAmount: number;

    @BelongsTo(() => WeeklyTimesheet, {
        foreignKey: 'timesheetId',
    })
    weeklyTimesheet: WeeklyTimesheet;
}

export default TimesheetDetail;
