import { Optional } from 'sequelize';

interface MedicalReportAttributes {
    id: number;
    requestId: number;
    firstName: string;
    lastName: string;
    location: string;
    dob: Date;
    serviceDate?: Date;
    phoneNumber: string;
    email: string;
    presentIllnessHistory?: string;
    medicalHistory?: string;
    medications?: string;
    allergies?: string;
    temperature?: number;
    heartRate?: number;
    repositoryRate?: number;
    sisBP?: number;
    diaBP?: number;
    oxygen?: number;
    pain?: string;
    heent?: string;
    cv?: string;
    chest?: string;
    abd?: string;
    extr?: string;
    skin?: string;
    neuro?: string;
    other?: string;
    diagnosis?: string;
    treatmentPlan?: string;
    medicationDispensed?: string;
    procedure?: string;
    followUp?: string;
    isFinalize: boolean;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
}

type MedicalReportCreationAttributes = Optional<MedicalReportAttributes, 'id'>;

export { MedicalReportAttributes, MedicalReportCreationAttributes };
