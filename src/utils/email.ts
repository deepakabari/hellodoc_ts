import { createTransport, SentMessageInfo } from "nodemailer";
import dotenv from 'dotenv'
dotenv.config();

interface EmailAuth {
    user: string;
    pass: string;
}

const transporter: SentMessageInfo = createTransport({
    service: "outlook",
    auth: {
        user: process.env.EMAIL_FROM,
        pass: process.env.EMAIL_PASSWORD,
    } as EmailAuth,
});

export default transporter;
