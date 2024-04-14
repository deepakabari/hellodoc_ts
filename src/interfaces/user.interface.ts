import { Optional } from 'sequelize';

interface UserAttributes {
    id: number;
    userName?: string;
    email: string;
    password?: string;
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    street?: string;
    address1?: string;
    address2?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    dob?: Date;
    altPhone?: string;
    status?: string;
    accountType?: string;
    medicalLicense?: string;
    photo?: string;
    signature?: string;
    isAgreementDoc?: boolean;
    isBackgroundDoc?: boolean;
    isHippaDoc?: boolean;
    isNonDisclosureDoc?: boolean;
    isLicenseDoc?: boolean;
    NPINumber?: string;
    syncEmailAddress?: string;
    resetToken?: string | null;
    expireToken?: Date | null;
    onCallStatus?: string;
    isDeleted?: boolean;
    stopNotification?: boolean;
    roleId?: number
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date | null;
}

type UserCreationAttributes = Optional<UserAttributes, 'id'>;

export { UserAttributes, UserCreationAttributes };
