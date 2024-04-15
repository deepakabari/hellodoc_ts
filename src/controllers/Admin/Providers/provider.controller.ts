import { AccountType } from '../../../utils/enum.constant';
import httpCode from '../../../constants/http.constant';
import messageConstant from '../../../constants/message.constant';
import {
    Business,
    EmailLog,
    Region,
    RequestWiseFiles,
    Role,
    SMSLog,
    User,
    UserRegion,
} from '../../../db/models/index';
import { Controller, FieldUpdates } from '../../../interfaces';
import dotenv from 'dotenv';
import linkConstant from '../../../constants/link.constant';
import transporter from '../../../utils/email';
import { sendSMS } from '../../../utils/smsSender';
import bcrypt from 'bcrypt';
import { Order } from 'sequelize';
import { Op } from 'sequelize';
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
        const { regions, sortBy, orderBy, page, pageSize } = req.query;

        const pageNumber = parseInt(page as string, 10) || 1;
        const limit = parseInt(pageSize as string, 10) || 10;
        const offset = (pageNumber - 1) * limit;

        let sortByModel: Order = [];

        if (sortBy && orderBy) {
            sortByModel = [[sortBy, orderBy]] as Order;
        }

        let regionWhereClause = {};
        if (regions && regions !== 'all') {
            regionWhereClause = { name: regions as string };
        }

        const providerInformation = await User.findAndCountAll({
            attributes: [
                'id',
                'firstName',
                'lastName',
                'accountType',
                'onCallStatus',
                'status',
                'email',
                'phoneNumber',
                'stopNotification',
            ],
            where: {
                accountType: AccountType.Physician,
                isDeleted: false,
            },
            include: {
                model: Region,
                attributes: [],
                through: { attributes: [] },
                where: regionWhereClause,
            },
            distinct: true,
            order: sortByModel,
            limit,
            offset,
        });

        return res.status(httpCode.OK).json({
            status: httpCode.OK,
            message: messageConstant.PROVIDER_RETRIEVED,
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

            return transporter.sendMail(mailOptions, async (error: Error) => {
                if (error) {
                    throw error;
                } else {
                    await EmailLog.create({
                        email: user?.email as string,
                        senderId: req.user.id,
                        receiverId: user?.id,
                        sentDate: new Date(),
                        isEmailSent: true,
                        sentTries: 1,
                        action: 'Provider Contact',
                    });
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

        await SMSLog.create({
            phoneNumber: user?.phoneNumber as string,
            senderId: req.user.id,
            receiverId: user?.id,
            sentDate: new Date(),
            isSMSSent: true,
            sentTries: 1,
            action: 'Provider Contact',
        });

        return res.status(httpCode.OK).json({
            status: httpCode.OK,
            message: messageConstant.EMAIL_SMS_SENT,
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
                'photo',
                'signature',
                'isAgreementDoc',
                'isBackgroundDoc',
                'isNonDisclosureDoc',
                'isLicenseDoc',
                'isHipaaDoc',
            ],
            include: [
                {
                    model: Region,
                    attributes: ['id', 'name'],
                    through: { attributes: [] },
                },
                {
                    model: Role,
                    attributes: ['id', 'Name'],
                },
            ],
            where: { id },
        });

        const businessDetails = await Business.findAll({
            attributes: ['id', 'businessName', 'businessWebsite'],
            where: { userId: id },
        });

        const files = await RequestWiseFiles.findAll({
            attributes: ['id', 'fileName', 'docType', 'documentPath'],
            where: { requestId: id },
        });

        if (!physicianProfile && !businessDetails && !files) {
            return res.status(httpCode.BAD_REQUEST).json({
                status: httpCode.BAD_REQUEST,
                message: messageConstant.DATA_NOT_FOUND,
            });
        }

        return res.status(httpCode.OK).json({
            status: httpCode.OK,
            message: messageConstant.PROFILE_RETRIEVED,
            data: { physicianProfile, businessDetails, files },
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
        const { businessName, businessWebsite, regions } = req.body;
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

                const fileColumnMapping: { [key: string]: string } = {
                    backgroundCheck: 'isBackgroundDoc',
                    nonDisclosureAgreement: 'isNonDisclosureDoc',
                    hipaaCompliance: 'isHipaaDoc',
                    independentContract: 'isAgreementDoc',
                    licenseDoc: 'isLicenseDoc',
                };

                if (files) {
                    for (const [key, value] of Object.entries(
                        fileColumnMapping,
                    )) {
                        if (files[key] && files[key][0]) {
                            // Update the requestWiseFiles table
                            await RequestWiseFiles.create({
                                requestId: id as unknown as number,
                                fileName: files[key][0].filename,
                                docType: key,
                                documentPath: files[key][0].path,
                            });

                            // Set the corresponding column to true
                            const userUpdate: any = {};
                            userUpdate[value] = true;
                            await User.update(userUpdate, {
                                where: { id },
                            });
                        }
                    }
                }

                return true;
            } catch (error) {
                console.error('Transaction failed:', error);
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
            'roleId',
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
                fieldUpdates[field] =
                    field === 'password'
                        ? await hashPassword(req.body[field])
                        : req.body[field];
            }
        }

        const updateResult = await updatePhysicianDetails(
            id,
            fieldUpdates,
            files,
        );

        if (regions) {
            await UserRegion.destroy({
                where: { userId: id },
                force: true,
            });

            for (const regionId of regions) {
                await UserRegion.create({
                    userId: id as unknown as number,
                    regionId: regionId,
                });
            }
        }

        if (!updateResult) {
            return res.status(httpCode.INTERNAL_SERVER_ERROR).json({
                status: httpCode.INTERNAL_SERVER_ERROR,
                message: messageConstant.UPDATE_FAILED,
            });
        }

        return res.status(httpCode.OK).json({
            status: httpCode.OK,
            message: messageConstant.PROFILE_UPDATED,
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
        const address = 'Ahmedabad';
        const url = `https://maps.googleapis.com/maps/api/json?key=${apiKey}&address=${address}`;

        const response = await fetch(url);
        const data = await response.json();
        return res.json(data);
    } catch (error) {
        throw error;
    }
};

export const updateNotification: Controller = async (req, res) => {
    try {
        const { physicianIds } = req.body;

        // Set stopNotification to false for all physicians
        await User.update(
            { stopNotification: false },
            { where: { accountType: AccountType.Physician } },
        );

        // Set stopNotification to true for the provided physicianIds
        await User.update(
            { stopNotification: true },
            {
                where: {
                    id: { [Op.in]: physicianIds },
                    accountType: AccountType.Physician,
                },
            },
        );

        return res.status(httpCode.OK).json({
            status: httpCode.OK,
            message: messageConstant.NOTIFICATION_UPDATED,
        });
    } catch (error) {
        throw error;
    }
};

export const deleteAccount: Controller = async (req, res) => {
    try {
        const { id } = req.params;

        await User.destroy({
            where: { id },
        });

        return res.status(httpCode.OK).json({
            status: httpCode.OK,
            message: messageConstant.USER_DELETED,
        });
    } catch (error) {
        throw error;
    }
};
