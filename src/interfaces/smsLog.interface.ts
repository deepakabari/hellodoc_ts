import { Optional } from 'sequelize';

interface SMSLogAttributes {
    id: number;
    phoneNumber: string
    confirmationNumber?: string
    senderId: number
    receiverId?: number
    sentDate: Date
    isSMSSent: boolean
    sentTries?: number
    action?: string
}

type SMSLogCreationAttributes = Optional<SMSLogAttributes, 'id'>;

export { SMSLogAttributes, SMSLogCreationAttributes };
