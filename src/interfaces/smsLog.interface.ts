import { Optional } from 'sequelize';

interface SMSLogAttributes {
    id: number;
    phoneNumber: string
    confirmationNumber?: string
    userId: number
    requestId?: number
    sentDate: Date
    isSMSSent: boolean
    sentTries?: number
}

type SMSLogCreationAttributes = Optional<SMSLogAttributes, 'id'>;

export { SMSLogAttributes, SMSLogCreationAttributes };
