import { AccountType } from '../../../utils/enum.constant';
import httpCode from '../../../constants/http.constant';
import messageConstant from '../../../constants/message.constant';
import { Business, Region, User } from '../../../db/models/index';
import { Controller, FieldUpdates } from '../../../interfaces';
import dotenv from 'dotenv';
import linkConstant from '../../../constants/link.constant';
import transporter from '../../../utils/email';
import { sendSMS } from '../../../utils/smsSender';
import bcrypt from 'bcrypt';
dotenv.config();

/**
 * @function providerInformation
 * @param req - Express request object.
 * @param res - Express response object used to send back the HTTP response.
 * @returns - Returns a Promise that resolves to an Express response object. The response contains the HTTP status code, a success message, and an array of provider information.
 * @description This controller function retrieves a list of providers from the database using the `User.findAll` method. It selects specific attributes for each provider, including the provider's ID, full name, role, on-call status, status, email, and phone number. The function filters the results to only include users with an account type of 'Physician'. The function then sends this data back to the client in the response body along with a success message.
 */
export const providerInformation: Controller = async (req, res) => {
    try {
        const { regions } = req.query;
        const providerInformation = await User.findAll({
            attributes: [
                'id',
                'firstName',
                'lastName',
                'accountType',
                'onCallStatus',
                'status',
                'email',
                'phoneNumber',
                'notification',
            ],
            where: {
                accountType: AccountType.Physician,
            },
            include: {
                model: Region,
                attributes: ['id', 'name'],
                through: { attributes: [] },
                where: {
                    ...(regions ? { name: regions as string } : {}),
                },
            },
        });

        return res.status(httpCode.OK).json({
            status: httpCode.OK,
            message: messageConstant.SUCCESS,
            data: providerInformation,
        });
    } catch (error) {
        throw error;
    }
};

/**
 * @function contactProvider
 * @param req - Express request object.
 * @param res - Express response object used to send back the HTTP response.
 * @returns - Returns a Promise that resolves to an Express response object. The response contains the HTTP status code, a success message.
 * @description This controller function takes messageBody and contactMethod as request body and
 */
export const contactProvider: Controller = async (req, res) => {
    try {
        const { id } = req.params;
        const { messageBody, contactMethod } = req.body;

        const user = await User.findOne({
            where: { id },
        });

        const sendEmail = (message: string) => {
            let mailOptions = {
                from: process.env.EMAIL_FROM,
                to: user?.email,
                subject: linkConstant.contactSubject,
                text: message,
            };

            return transporter.sendMail(mailOptions, (error: Error) => {
                if (error) {
                    throw error;
                } else {
                    console.log('Email Sent Successfully');
                }
            });
        };

        switch (contactMethod) {
            case 'sms':
                sendSMS(messageBody);
                break;
            case 'email':
                sendEmail(messageBody);
                break;
            case 'both':
                sendSMS(messageBody);
                sendEmail(messageBody);
                break;
        }

        return res.status(httpCode.OK).json({
            status: httpCode.OK,
            message: messageConstant.SUCCESS,
        });
    } catch (error) {
        throw error;
    }
};

/**
 * @function physicianProfileInAdmin
 * @param req - Express request object.
 * @param res - Express response object used to send back the HTTP response.
 * @returns - Returns a Promise that resolves to an Express response object. The response contains the HTTP status code, a success message, and an array of physician profiles.
 * @description This controller function retrieves a list of physician profiles from the database using the `User.findAll` method. It selects a comprehensive set of attributes for each physician, including personal details, contact information, medical credentials, and administrative notes. The function then sends this data back to the client in the response body along with a success message.
 */
export const physicianProfileInAdmin: Controller = async (req, res) => {
    try {
        const { id } = req.params;
        const physicianProfile = await User.findAll({
            attributes: [
                'id',
                'userName',
                'status',
                'firstName',
                'lastName',
                'email',
                'phoneNumber',
                'medicalLicense',
                'NPINumber',
                'syncEmailAddress',
                'address1',
                'address2',
                'city',
                'state',
                'zipCode',
                'altPhone',
                'businessName',
                'businessWebsite',
                'photo',
                'signature',
                'isAgreementDoc',
                'isBackgroundDoc',
                'isNonDisclosureDoc',
                'isLicenseDoc',
            ],
            where: { id },
        });

        if (!physicianProfile) {
            return res.status(httpCode.NOT_FOUND).json({
                status: httpCode.NOT_FOUND,
                message: messageConstant.DATA_NOT_FOUND,
            });
        }

        return res.status(httpCode.OK).json({
            status: httpCode.OK,
            message: messageConstant.SUCCESS,
            data: physicianProfile,
        });
    } catch (error) {
        throw error;
    }
};

/**
 * @function editPhysicianProfile
 * @param req
 * @param res
 * @returns
 */
export const editPhysicianProfile: Controller = async (req, res) => {
    try {
        const { id } = req.params;
        const { businessName, businessWebsite } = req.body;
        const files = req.files as {
            [fieldName: string]: Express.Multer.File[];
        };

        const updatePhysicianDetails = async (
            id: string,
            fieldUpdates: FieldUpdates,
            files?: { [fieldName: string]: Express.Multer.File[] },
        ) => {
            try {
                if (files) {
                    if (files.photo && files.photo[0]) {
                        fieldUpdates.photo = files.photo[0].filename;
                    }
                    if (files.signature && files.signature[0]) {
                        fieldUpdates.signature = files.signature[0].filename;
                    }
                }

                await User.update(fieldUpdates, {
                    where: { id },
                });

                await Business.update(
                    { businessName, businessWebsite },
                    { where: { userId: id } },
                );

                return true;
            } catch (error) {
                return false;
            }
        };

        let fieldUpdates: any = {};

        const fields = [
            'password',
            'status',
            'firstName',
            'lastName',
            'email',
            'phoneNumber',
            'medicalLicense',
            'NPINumber',
            'syncEmailAddress',
            'address1',
            'address2',
            'city',
            'state',
            'zipCode',
            'altPhone',
        ];

        const hashPassword = async (password: string): Promise<string> => {
            const saltRounds = process.env.ITERATION;
            const hashedPassword = await bcrypt.hash(
                password,
                Number(saltRounds),
            );
            return hashedPassword;
        };

        for (const field of fields) {
            if (req.body[field] !== undefined) {
                if (field === 'password') {
                    fieldUpdates[field] = await hashPassword(req.body[field]);
                } else {
                    fieldUpdates[field] = req.body[field];
                }
            }
        }

        const updateResult = await updatePhysicianDetails(
            id,
            fieldUpdates,
            files,
        );

        if (!updateResult) {
            return res.status(httpCode.INTERNAL_SERVER_ERROR).json({
                status: httpCode.INTERNAL_SERVER_ERROR,
                message: messageConstant.UPDATE_FAILED,
            });
        }

        return res.status(httpCode.OK).json({
            status: httpCode.OK,
            message: messageConstant.SUCCESS,
        });
    } catch (error) {
        throw error;
    }
};

export const providerLocation: Controller = async (req, res) => {
    try {
        const apiKey = process.env.GOOGLE_MAPS_API_KEY;
        const lat = 23.034721;
        const lng = 72.500535;
        const address = "Ahmedabad"
        const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${address}`;

        const response = await fetch(url);  
        const data = await response.json();
        return res.json(data);
    } catch (error) {
        throw error;
    }
}