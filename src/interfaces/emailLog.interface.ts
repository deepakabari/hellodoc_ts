import { Optional } from 'sequelize';

interface EmailLogAttributes {
    id: number;
    email: string
    confirmationNumber?: string
    senderId: number | null;
    receiverId?: number | null
    sentDate: Date
    isEmailSent: boolean
    sentTries?: number
    action?: string
}

type EmailLogCreationAttributes = Optional<EmailLogAttributes, 'id'>;

export { EmailLogAttributes, EmailLogCreationAttributes };
