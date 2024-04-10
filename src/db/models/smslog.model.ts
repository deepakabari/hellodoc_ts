import { Table, Column, Model, BelongsTo } from 'sequelize-typescript';
import { DataTypes } from 'sequelize';
import { SMSLogAttributes, SMSLogCreationAttributes } from '../../interfaces';
import { Role, User } from './index';

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
    senderId: number;

    @Column({ type: DataTypes.INTEGER, allowNull: false })
    receiverId: number;

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

    @BelongsTo(() => User, {
        foreignKey: 'senderId',
        targetKey: 'id',
        as: 'sender',
    })
    sender: User;

    @BelongsTo(() => User, {
        foreignKey: 'receiverId',
        targetKey: 'id',
        as: 'receiver',
    })
    receiver: User;
}

export default SMSLog;
