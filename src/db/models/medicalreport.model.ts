import { Table, Column, Model, BelongsTo } from 'sequelize-typescript';
import { DataTypes } from 'sequelize';
import {
    MedicalReportAttributes,
    MedicalReportCreationAttributes,
} from '../../interfaces';
import { Request } from './index';

@Table({
    timestamps: true,
    paranoid: true,
})
class MedicalReport extends Model<
    MedicalReportAttributes,
    MedicalReportCreationAttributes
> {
    @Column({
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
    })
    id: number;

    @Column({ type: DataTypes.INTEGER, allowNull: false })
    requestId: number;

    @Column({ type: DataTypes.STRING, allowNull: false })
    firstName: string;

    @Column({ type: DataTypes.STRING, allowNull: false })
    lastName: string;

    @Column({ type: DataTypes.STRING, allowNull: false })
    location: string;

    @Column({ type: DataTypes.DATEONLY, allowNull: false })
    dob: Date;

    @Column({ type: DataTypes.DATEONLY, allowNull: true })
    serviceDate: Date;

    @Column({ type: DataTypes.STRING, allowNull: false })
    phoneNumber: string;

    @Column({ type: DataTypes.STRING, allowNull: false })
    email: string;

    @Column({ type: DataTypes.STRING, allowNull: true })
    presentIllnessHistory: string;

    @Column({ type: DataTypes.STRING, allowNull: true })
    medicalHistory: string;

    @Column({ type: DataTypes.STRING, allowNull: true })
    medications: string;

    @Column({ type: DataTypes.STRING, allowNull: true })
    allergies: string;

    @Column({ type: DataTypes.INTEGER, allowNull: true })
    temperature: number;

    @Column({ type: DataTypes.INTEGER, allowNull: true })
    heartRate: number;

    @Column({ type: DataTypes.INTEGER, allowNull: true })
    repositoryRate: number;

    @Column({ type: DataTypes.INTEGER, allowNull: true })
    sisBP: number;

    @Column({ type: DataTypes.INTEGER, allowNull: true })
    diaBP: number;

    @Column({ type: DataTypes.INTEGER, allowNull: true })
    oxygen: number;

    @Column({ type: DataTypes.STRING, allowNull: true })
    pain: string;

    @Column({ type: DataTypes.STRING, allowNull: true })
    heent: string;

    @Column({ type: DataTypes.STRING, allowNull: true })
    cv: string;

    @Column({ type: DataTypes.STRING, allowNull: true })
    chest: string;

    @Column({ type: DataTypes.STRING, allowNull: true })
    abd: string;

    @Column({ type: DataTypes.STRING, allowNull: true })
    extr: string;

    @Column({ type: DataTypes.STRING, allowNull: true })
    skin: string;

    @Column({ type: DataTypes.STRING, allowNull: true })
    neuro: string;

    @Column({ type: DataTypes.STRING, allowNull: true })
    other: string;

    @Column({ type: DataTypes.STRING, allowNull: true })
    diagnosis: string;

    @Column({ type: DataTypes.STRING, allowNull: true })
    treatmentPlan: string;

    @Column({ type: DataTypes.STRING, allowNull: true })
    medicationDispensed: string;

    @Column({ type: DataTypes.STRING, allowNull: true })
    procedure: string;

    @Column({ type: DataTypes.STRING, allowNull: true })
    followUp: string;

    @Column({ type: DataTypes.BOOLEAN, allowNull: false })
    isFinalize: boolean;

    @BelongsTo(() => Request, { foreignKey: 'requestId' })
    request: Request;
}

export default MedicalReport;
