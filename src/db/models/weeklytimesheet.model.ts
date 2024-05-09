import { BelongsTo, Column, HasMany, Model, Table } from 'sequelize-typescript';
import {
    WeeklyTimesheetAttributes,
    WeeklyTimesheetCreationAttributes,
} from '../../interfaces';
import { DataTypes } from 'sequelize';
import { PayRate, TimesheetDetail, User } from './index';

@Table({
    timestamps: true,
    paranoid: true,
})
class WeeklyTimesheet extends Model<
    WeeklyTimesheetAttributes,
    WeeklyTimesheetCreationAttributes
> {
    @Column({
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
    })
    id: number;

    @Column({ type: DataTypes.DATEONLY, allowNull: false })
    startDate: Date;

    @Column({ type: DataTypes.DATEONLY, allowNull: false })
    endDate: Date;

    @Column({ type: DataTypes.INTEGER, allowNull: true })
    status: number;

    @Column({ type: DataTypes.INTEGER, allowNull: false })
    physicianId: number;

    @Column({ type: DataTypes.INTEGER, allowNull: false })
    payRateId: number;

    @Column({ type: DataTypes.INTEGER, allowNull: true })
    adminId: number;

    @Column({ type: DataTypes.BOOLEAN, allowNull: true })
    isFinalize: boolean;

    @Column({ type: DataTypes.STRING, allowNull: true })
    adminNote: string;

    @Column({ type: DataTypes.INTEGER, allowNull: true })
    totalAmount: number;

    @Column({ type: DataTypes.INTEGER, allowNull: true })
    bonusAmount: number;

    @HasMany(() => TimesheetDetail, {
        foreignKey: 'timesheetId',
        sourceKey: 'id',
    })
    timesheetDetails: TimesheetDetail[];

    @BelongsTo(() => PayRate, {
        foreignKey: 'payRateId',
    })
    weeklyPayRate: PayRate;

    @BelongsTo(() => User, {
        foreignKey: 'physicianId',
        as: 'physicianSheet',
    })
    physicianSheet: User;

    @BelongsTo(() => User, {
        foreignKey: 'adminId',
        as: 'adminSheet',
    })
    adminSheet: User;
}

export default WeeklyTimesheet;
