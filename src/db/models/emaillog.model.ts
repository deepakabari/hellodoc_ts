import { Table, Column, Model, BelongsTo } from 'sequelize-typescript';
import { DataTypes } from 'sequelize';
import {
    EmailLogAttributes,
    EmailLogCreationAttributes,
} from '../../interfaces';
import { User, Request, Role } from './index';

@Table({
    timestamps: true,
    paranoid: true,
})
class EmailLog extends Model<EmailLogAttributes, EmailLogCreationAttributes> {
    @Column({
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
    })
    id: number;

    @Column({ type: DataTypes.STRING, allowNull: false })
    email: string;

    @Column({ type: DataTypes.STRING, allowNull: true })
    confirmationNumber: string;

    @Column({ type: DataTypes.INTEGER, allowNull: false })
    senderId: number;

    @Column({ type: DataTypes.INTEGER, allowNull: true })
    receiverId: number;

    @Column({ type: DataTypes.DATE, allowNull: false })
    sentDate: Date;

    @Column({ type: DataTypes.BOOLEAN, allowNull: false })
    isEmailSent: boolean;

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
    
    @BelongsTo(() => Role, {
        foreignKey: 'roleId',
        targetKey: 'id',
    })
    role: Role;
}

export default EmailLog;
