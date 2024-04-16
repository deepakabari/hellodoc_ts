import httpCode from '../../../constants/http.constant';
import messageConstant from '../../../constants/message.constant';
import { Controller } from '../../../interfaces';
import dotenv from 'dotenv';
dotenv.config();
import { User } from '../../../db/models/index';
import transporter from '../../../utils/email';
import { compileEmailTemplate } from '../../../utils/hbsCompiler';

export const requestToAdmin: Controller = async (req, res) => {
    try {
        const { id } = req.params;

        const { message } = req.body;

        const existingUser = await User.findByPk(id);

        if (!existingUser) {
            return res.status(httpCode.UNAUTHORIZED).json({
                status: httpCode.UNAUTHORIZED,
                message: messageConstant.USER_NOT_EXIST,
            });
        }

        const templateData = {
            providerId: id,
            providerName: existingUser.firstName + ' ' + existingUser.lastName,
            message,
        };

        const data = await compileEmailTemplate('requestToAdmin', templateData);

        const mailOptions = {
            from: existingUser.email,
            to: 'admin123@yopmail.com',
            subject: 'Provider Request to Edit Profile',
            html: data,
        };

        return transporter.sendMail(mailOptions, (error: Error) => {
            if (error) {
                throw error;
            } else {
                return res.status(httpCode.OK).json({
                    status: httpCode.OK,
                    message: messageConstant.EMAIL_SENT,
                });
            }
        });
    } catch (error) {
        throw error;
    }
};
