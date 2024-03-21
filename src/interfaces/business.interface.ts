import { Optional } from 'sequelize';

interface BusinessAttributes {
    id: number;
    userId: number;
    accountType: string;
    businessName: string;
    businessWebsite: string;
    businessContact: string;
    faxNumber: string;
    profession: string;
    phoneNumber: string;
    email: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
}

type BusinessCreationAttributes = Optional<BusinessAttributes, 'id'>;

export { BusinessAttributes, BusinessCreationAttributes };
