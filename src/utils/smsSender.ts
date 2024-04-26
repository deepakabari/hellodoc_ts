import twilio from 'twilio';
import { SMSLog } from '../db/models/index';

export const sendSMS = (
    message: string,
    phoneNumber: string,
    senderId: number,
    action: string,
    receiverId?: number,
) => {
    const client = twilio(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN,
    );

    client.messages
        .create({
            body: message,
            to: "+" + phoneNumber,
            from: process.env.TWILIO_PHONE_NUMBER,
        })
        .then((message) => console.log(message.sid))
        .then(() => {
            // Log SMS sending
            SMSLog.create({
                phoneNumber,
                senderId,
                receiverId,
                sentDate: new Date(),
                isSMSSent: true,
                sentTries: 1,
                action,
            });
        });
};
