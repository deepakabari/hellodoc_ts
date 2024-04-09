import { Optional } from 'sequelize';

interface EmailLogAttributes {
    id: number;
    email: string
    confirmationNumber?: string
    userId: number
    requestId?: number
    sentDate: Date
    isEmailSent: boolean
    sentTries?: number
}

type EmailLogCreationAttributes = Optional<EmailLogAttributes, 'id'>;

export { EmailLogAttributes, EmailLogCreationAttributes };
