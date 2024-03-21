import twilio from 'twilio';

export const sendSMS = (message: string) => {
    const client = twilio(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN,
    );

    client.messages
        .create({
            body: message,
            to: process.env.MY_PHONE_NUMBER as string,
            from: process.env.TWILIO_PHONE_NUMBER,
        })
        .then((message) => console.log(message.sid));
};
