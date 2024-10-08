import { Optional } from 'sequelize';

interface RequestAttributes {
    id: number;
    requestType: string;
    userId: number;
    patientFirstName: string;
    patientLastName: string;
    patientPhoneNumber: string;
    dob: Date;
    patientEmail: string;
    requestStatus: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    roomNumber?: string;
    patientNote?: string;
    documentPhoto?: string;
    physicianId?: number | null;
    requestorFirstName?: string;
    requestorLastName?: string;
    requestorPhoneNumber?: string;
    requestorEmail?: string;
    confirmationNumber?: string;
    isDeleted?: boolean;
    declinedBy?: number;
    caseNumber?: string;
    lastWellnessDate?: Date;
    callType?: string;
    completedByPhysician?: boolean;
    lastReservationDate?: Date;
    acceptedDate?: Date;
    relationName?: string;
    concludedDate?: Date;
    caseTag?: string;
    caseTagPhysician?: string;
    adminNotes?: string;
    physicianNotes?: string;
    transferNote?: string;
    reasonForCancellation?: string;
    isAgreementSent?: boolean;
    isAgreementAccepted?: boolean;
    agreementToken?: string | null
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date | null;
}

type RequestCreationAttributes = Optional<RequestAttributes, 'id'>;

export { RequestAttributes, RequestCreationAttributes };
