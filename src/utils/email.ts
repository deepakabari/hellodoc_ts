import { createTransport, SentMessageInfo } from 'nodemailer';
import dotenv from 'dotenv';
import { EmailLog } from '../db/models';
dotenv.config();

interface EmailAuth {
    user: string;
    pass: string;
}

const transporter: SentMessageInfo = createTransport({
    service: 'ethereal',
    auth: {
        user: process.env.EMAIL_FROM,
        pass: process.env.EMAIL_PASSWORD,
    } as EmailAuth,
    tls: { rejectUnauthorized: false },
});

export const sendEmail = async ({
    to,
    subject,
    text,
    html,
    attachments,
}: {
    to: string;
    subject: string;
    text?: string;
    html?: string;
    attachments?: { filename: string; path: string }[];
}) => {
    const mailOptions = {
        from: process.env.EMAIL_FROM,
        to,
        subject,
        text,
        html,
        attachments,
    };

    new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, (error: Error, info: string) => {
            if (error) {
                reject(error);
            } else {
                resolve(info);
            }
        });
    });
};
