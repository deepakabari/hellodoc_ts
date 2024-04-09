import { Table, Column, Model } from 'sequelize-typescript';
import { DataTypes } from 'sequelize';
import {
    SMSLogAttributes,
    SMSLogCreationAttributes,
} from '../../interfaces';

@Table({
    timestamps: true,
    paranoid: true,
})
class SMSLog extends Model<SMSLogAttributes, SMSLogCreationAttributes> {
    @Column({
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
    })
    id: number;

    @Column({ type: DataTypes.STRING, allowNull: false })
    phoneNumber: string;

    @Column({ type: DataTypes.STRING, allowNull: true })
    confirmationNumber: string;

    @Column({ type: DataTypes.INTEGER, allowNull: false })
    userId: number;

    @Column({ type: DataTypes.INTEGER, allowNull: true })
    requestId: number;

    @Column({ type: DataTypes.DATE, allowNull: false })
    sentDate: Date;

    @Column({ type: DataTypes.BOOLEAN, allowNull: false })
    isSMSSent: boolean;

    @Column({ type: DataTypes.INTEGER, allowNull: true })
    sentTries: number;

    @Column({
        type: DataTypes.STRING,
        allowNull: true,
    })
    action: string;
}

export default SMSLog;
