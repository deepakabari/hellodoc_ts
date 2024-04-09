import { Table, Column, Model } from 'sequelize-typescript';
import { DataTypes } from 'sequelize';
import {
    EmailLogAttributes,
    EmailLogCreationAttributes,
} from '../../interfaces';

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
    userId: number;

    @Column({ type: DataTypes.INTEGER, allowNull: true })
    requestId: number;

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
}

export default EmailLog;
