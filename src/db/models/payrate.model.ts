import { Table, Column, Model } from 'sequelize-typescript';
import { DataTypes } from 'sequelize';
import {
    PayRateAttributes,
    PayRateCreationAttributes,
} from '../../interfaces/payRate.interface';

@Table({
    timestamps: true,
    paranoid: true,
})
class PayRate extends Model<PayRateAttributes, PayRateCreationAttributes> {
    @Column({
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
    })
    id: number;

    @Column({ type: DataTypes.INTEGER, allowNull: false })
    physicianId: number;

    @Column({ type: DataTypes.INTEGER, allowNull: true })
    nightShiftWeekend: number;

    @Column({ type: DataTypes.INTEGER, allowNull: true })
    shift: number;

    @Column({ type: DataTypes.INTEGER, allowNull: true })
    houseCallNightWeekend: number;

    @Column({ type: DataTypes.INTEGER, allowNull: true })
    phoneConsult: number;

    @Column({ type: DataTypes.INTEGER, allowNull: true })
    phoneConsultNightWeekend: number;

    @Column({ type: DataTypes.INTEGER, allowNull: true })
    batchTesting: number;

    @Column({ type: DataTypes.INTEGER, allowNull: true })
    houseCall: number;
}
export default PayRate;