import httpCode from '../../../constants/http.constant';
import messageConstant from '../../../constants/message.constant';
import { Controller } from '../../../interfaces';
import dotenv from 'dotenv';
dotenv.config();
import { EmailLog, RequestWiseFiles, User } from '../../../db/models/index';
import transporter from '../../../utils/email';
import { compileEmailTemplate } from '../../../utils/hbsCompiler';

export const requestToAdmin: Controller = async (req, res) => {
    try {
        // Extract the user ID from the request parameters
        const { id } = req.params;

        // Extract the message from the request body
        const { message } = req.body;

        // Check if the user exists
        const existingUser = await User.findByPk(id);

        if (!existingUser) {
            return res.status(httpCode.UNAUTHORIZED).json({
                status: httpCode.UNAUTHORIZED,
                message: messageConstant.USER_NOT_EXIST,
            });
        }

        // Prepare data for the email template
        const templateData = {
            providerId: id,
            providerName: existingUser.firstName + ' ' + existingUser.lastName,
            message,
        };

        // Compile email template using the provided data
        const data = await compileEmailTemplate('requestToAdmin', templateData);

        const mailOptions = {
            from: existingUser.email,
            to: process.env.ADMIN,
            subject: 'Provider Request to Edit Profile',
            html: data,
        };

        new Promise((resolve, reject) => {
            transporter.sendMail(mailOptions, (error: Error, info: string) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(info);
                }
            });
        }).then(() => {
            EmailLog.create({
                email: process.env.ADMIN as string,
                senderId: existingUser?.id,
                receiverId: 1,
                sentDate: new Date(),
                isEmailSent: true,
                sentTries: 1,
                action: 'Edit request to admin',
            });
        });

        // If email is sent successfully, return success status with message
        return res.status(httpCode.OK).json({
            status: httpCode.OK,
            message: messageConstant.EMAIL_SENT,
        });
    } catch (error) {
        throw error;
    }
};
