import { Table, Column, Model, BelongsTo, HasMany } from 'sequelize-typescript';
import { DataTypes } from 'sequelize';
import {
    RequestAttributes,
    RequestCreationAttributes,
} from '../../interfaces/';
import { EmailLog, SMSLog, User } from '../models/index';
import { RequestWiseFiles } from './index';

@Table({
    timestamps: true,
    paranoid: true,
})
class Request extends Model<RequestAttributes, RequestCreationAttributes> {
    @Column({
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
    })
    id: number;

    @Column({
        allowNull: false,
        type: DataTypes.STRING,
    })
    requestType: string;

    @Column({
        allowNull: true,
        type: DataTypes.INTEGER,
    })
    userId: number;

    @Column({
        allowNull: true,
        type: DataTypes.STRING,
    })
    patientFirstName: string;

    @Column({
        allowNull: true,
        type: DataTypes.STRING,
    })
    patientLastName: string;

    @Column({
        allowNull: true,
        type: DataTypes.STRING,
    })
    patientPhoneNumber: string;

    @Column({
        allowNull: false,
        type: DataTypes.DATEONLY,
    })
    dob: Date;

    @Column({
        allowNull: true,
        type: DataTypes.STRING,
    })
    patientEmail: string;

    @Column({
        allowNull: false,
        type: DataTypes.STRING,
    })
    requestStatus: string;

    @Column({
        allowNull: false,
        type: DataTypes.STRING,
    })
    street: string;

    @Column({
        allowNull: false,
        type: DataTypes.STRING,
    })
    city: string;

    @Column({
        allowNull: false,
        type: DataTypes.STRING,
    })
    state: string;

    @Column({
        allowNull: false,
        type: DataTypes.STRING,
    })
    zipCode: string;

    @Column({
        allowNull: true,
        type: DataTypes.STRING,
    })
    roomNumber: string;

    @Column({
        allowNull: true,
        type: DataTypes.STRING,
    })
    patientNote: string;

    @Column({
        allowNull: true,
        type: DataTypes.STRING,
    })
    documentPhoto: string;

    @Column({
        allowNull: true,
        type: DataTypes.INTEGER,
    })
    physicianId?: number;

    @Column({
        allowNull: true,
        type: DataTypes.STRING,
    })
    requestorFirstName?: string;

    @Column({
        allowNull: true,
        type: DataTypes.STRING,
    })
    requestorLastName?: string;

    @Column({
        allowNull: true,
        type: DataTypes.STRING,
    })
    requestorEmail?: string;

    @Column({
        allowNull: true,
        type: DataTypes.STRING,
    })
    requestorPhoneNumber?: string;

    @Column({
        allowNull: true,
        type: DataTypes.STRING,
    })
    confirmationNumber?: string;

    @Column({
        allowNull: true,
        type: DataTypes.BOOLEAN,
    })
    isDeleted?: boolean;

    @Column({
        allowNull: true,
        type: DataTypes.STRING,
    })
    declinedBy?: string;

    @Column({
        allowNull: true,
        type: DataTypes.BOOLEAN,
    })
    isUrgentEmailSent: boolean;

    @Column({
        allowNull: true,
        type: DataTypes.DATE,
    })
    lastWellnessDate?: Date;

    @Column({
        allowNull: true,
        type: DataTypes.STRING,
    })
    callType?: string;

    @Column({
        allowNull: true,
        type: DataTypes.BOOLEAN,
    })
    completedByPhysician?: boolean;

    @Column({
        allowNull: true,
        type: DataTypes.DATE,
    })
    lastReservationDate?: Date;

    @Column({
        allowNull: true,
        type: DataTypes.DATE,
    })
    acceptedDate?: Date;

    @Column({
        allowNull: true,
        type: DataTypes.STRING,
    })
    relationName?: string;

    @Column({
        allowNull: true,
        type: DataTypes.DATE,
    })
    concludedDate?: Date;

    @Column({
        allowNull: true,
        type: DataTypes.STRING,
    })
    caseTag?: string;

    @Column({
        allowNull: true,
        type: DataTypes.STRING,
    })
    caseTagPhysician?: string;

    @Column({
        allowNull: true,
        type: DataTypes.STRING,
    })
    adminNotes: string;

    @Column({
        allowNull: true,
        type: DataTypes.STRING,
    })
    physicianNotes: string;

    @Column({
        allowNull: true,
        type: DataTypes.STRING,
    })
    reasonForCancellation: string;

    @Column({
        allowNull: true,
        type: DataTypes.STRING,
    })
    transferNote: string;

    @Column({
        allowNull: true,
        type: DataTypes.BOOLEAN,
    })
    isAgreementSent: boolean;

    @Column({
        allowNull: true,
        type: DataTypes.BOOLEAN,
    })
    isAgreementAccepted: boolean;

    @BelongsTo(() => User, {
        foreignKey: 'userId',
        targetKey: 'id',
        as: 'user',
    })
    user: User;

    @BelongsTo(() => User, {
        foreignKey: 'physicianId',
        targetKey: 'id',
        as: 'physician',
    })
    physician: User;

    @HasMany(() => RequestWiseFiles, {
        foreignKey: 'requestId',
        sourceKey: 'id',
    })
    requestWiseFiles: RequestWiseFiles[];

    @HasMany(() => EmailLog, {
        foreignKey: 'requestId',
        sourceKey: 'id',
        as: 'requestEmailLog',
    })
    requestEmailLogs: EmailLog[];

    @HasMany(() => SMSLog, {
        foreignKey: 'requestId',
        sourceKey: 'id',
        as: 'requestSMSLog',
    })
    requestSMSLogs: SMSLog[];
}

export default Request;
