import fs from 'fs';
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
import { sendEmail } from '../../../utils/email';
import { sendSMS } from '../../../utils/smsSender';
import bcrypt from 'bcrypt';
import { Order } from 'sequelize';
import { Op } from 'sequelize';
import { sequelize } from '../../../db/config/db.connection';
dotenv.config();

const myNumber = process.env.MY_PHONE_NUMBER as string;

/**
 * @function providerInformation
 * @param req - Express request object.
 * @param res - Express response object used to send back the HTTP response.
 * @returns - Returns a Promise that resolves to an Express response object. The response contains the HTTP status code, a success message, and an array of provider information.
 * @description This controller function retrieves a list of providers from the database using the `User.findAll` method. It selects specific attributes for each provider, including the provider's ID, full name, role, on-call status, status, email, and phone number. The function filters the results to only include users with an account type of 'Physician'. The function then sends this data back to the client in the response body along with a success message.
 */
export const providerInformation: Controller = async (req, res) => {
    try {
        // Extract query parameters
        const { regions, sortBy, orderBy, page, pageSize } = req.query;

        // Parse pagination parameters
        const pageNumber = parseInt(page as string, 10) || 1;
        const limit = parseInt(pageSize as string, 10) || 10;
        const offset = (pageNumber - 1) * limit;

        // Define sorting options
        let sortByModel: Order = [];

        if (sortBy && orderBy) {
            sortByModel = [[sortBy, orderBy]] as Order;
        }

        // Define region where clause
        let regionWhereClause = {};
        if (regions && regions !== 'all') {
            regionWhereClause = { name: regions as string };
        }

        // Retrieve provider information based on query parameters
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
                required: false,
            },
            distinct: true,
            order: sortByModel,
            limit,
            offset,
        });

        // Return response with provider information
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
        // Extract provider id from request parameters
        const { id } = req.params;

        // Check if the provider exists
        const user = await User.findByPk(id);
        if (!user) {
            return res.status(httpCode.BAD_REQUEST).json({
                status: httpCode.BAD_REQUEST,
                message: messageConstant.INVALID_INPUT,
            });
        }

        // Extract message body and contact method from request body
        const { messageBody, contactMethod } = req.body;

        // Switch based on the contact method chosen
        switch (contactMethod) {
            case 'sms':
                sendSMS(
                    messageBody,
                    myNumber,
                    req.user.id,
                    'Provider Contact',
                    user.id,
                );
                break;
            case 'email':
                sendEmail({
                    to: user.email,
                    subject: linkConstant.contactSubject,
                    text: messageBody,
                });
                break;
            case 'both':
                sendSMS(
                    messageBody,
                    myNumber,
                    req.user.id,
                    'Provider Contact',
                    user.id,
                );
                sendEmail({
                    to: user.email,
                    subject: linkConstant.contactSubject,
                    text: messageBody,
                });
                break;
        }

        await EmailLog.create({
            email: user?.email as string,
            senderId: req.user.id,
            receiverId: user?.id,
            sentDate: new Date(),
            isEmailSent: true,
            sentTries: 1,
            action: 'Provider Contact',
        });

        // Return success response
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
        // Extract physician id from request parameters
        const { id } = req.params;

        // Check if the physician exists
        const exists = await User.findByPk(id);
        if (!exists) {
            return res.status(httpCode.BAD_REQUEST).json({
                status: httpCode.BAD_REQUEST,
                message: messageConstant.INVALID_INPUT,
            });
        }

        // Retrieve physician profile details including associated data
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
                'notes',
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
                {
                    model: Business,
                    attributes: ['id', 'businessName', 'businessWebsite'],
                    required: false,
                },
                {
                    model: RequestWiseFiles,
                    attributes: ['id', 'fileName', 'docType', 'documentPath'],
                    required: false,
                },
            ],
            where: { id },
        });

        // Return the physician profile data
        return res.status(httpCode.OK).json({
            status: httpCode.OK,
            message: messageConstant.PROFILE_RETRIEVED,
            data: { physicianProfile },
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
        // Extract parameters from request
        const { id } = req.params;
        const { businessName, businessWebsite, regions } = req.body;
        const files = req.files as {
            [fieldName: string]: Express.Multer.File[];
        };

        // Inner function to update physician details
        const updatePhysicianDetails = async (
            id: string,
            fieldUpdates: FieldUpdates,
            files?: { [fieldName: string]: Express.Multer.File[] },
        ) => {
            try {
                // Update user and business details
                await User.update(fieldUpdates, {
                    where: { id },
                });

                await Business.update(
                    { businessName, businessWebsite },
                    { where: { userId: id } },
                );

                // Mapping of file types to database columns
                const fileColumnMapping: { [key: string]: string } = {
                    Photo: 'Photo',
                    Signature: 'Signature',
                    backgroundCheck: 'isBackgroundDoc',
                    nonDisclosureAgreement: 'isNonDisclosureDoc',
                    hipaaCompliance: 'isHipaaDoc',
                    independentContract: 'isAgreementDoc',
                    licenseDoc: 'isLicenseDoc',
                };

                // Process and update uploaded files
                if (files) {
                    for (const [key, value] of Object.entries(
                        fileColumnMapping,
                    )) {
                        if (files[key] && files[key][0]) {
                            const existingFile = await RequestWiseFiles.findOne(
                                {
                                    where: {
                                        userId: id,
                                        docType: key,
                                    },
                                },
                            );

                            if (existingFile) {
                                await fs.promises.unlink(
                                    existingFile.documentPath as string,
                                );

                                await RequestWiseFiles.destroy({
                                    where: {
                                        userId: id,
                                        docType: key,
                                    },
                                });
                            }

                            // Update the requestWiseFiles table
                            await RequestWiseFiles.create({
                                userId: id as unknown as number,
                                fileName: files[key][0].filename,
                                docType: key,
                                documentPath: files[key][0].path,
                                createdAt: new Date(),
                                updatedAt: new Date(),
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
                return false;
            }
        };

        let fieldUpdates: any = {};

        // Define fields to update
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
            'notes',
        ];

        // Hash password if provided
        const hashPassword = async (password: string): Promise<string> => {
            const saltRounds = process.env.ITERATION;
            const hashedPassword = await bcrypt.hash(
                password,
                Number(saltRounds),
            );
            return hashedPassword;
        };

        // Process fields for update
        for (const field of fields) {
            if (req.body[field] !== undefined) {
                fieldUpdates[field] =
                    field === 'password'
                        ? await hashPassword(req.body[field])
                        : req.body[field];
            }
        }

        // Update physician details
        const updateResult = await updatePhysicianDetails(
            id,
            fieldUpdates,
            files,
        );

        // Update user regions if provided
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

        // Handle update result
        if (!updateResult) {
            return res.status(httpCode.INTERNAL_SERVER_ERROR).json({
                status: httpCode.INTERNAL_SERVER_ERROR,
                message: messageConstant.UPDATE_FAILED,
            });
        }

        // Return success response
        return res.status(httpCode.OK).json({
            status: httpCode.OK,
            message: messageConstant.PROFILE_UPDATED,
        });
    } catch (error) {
        throw error;
    }
};

export const updateNotification: Controller = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        // Extract physician IDs from request body
        const { physicianIds } = req.body;

        // Set stopNotification to false for all physicians
        await User.update(
            { stopNotification: false },
            { where: { accountType: AccountType.Physician }, transaction },
        );

        // Set stopNotification to true for the provided physicianIds
        await User.update(
            { stopNotification: true },
            {
                where: {
                    id: { [Op.in]: physicianIds },
                    accountType: AccountType.Physician,
                },
                transaction,
            },
        );

        await transaction.commit();

        return res.status(httpCode.OK).json({
            status: httpCode.OK,
            message: messageConstant.NOTIFICATION_UPDATED,
        });
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

export const deleteAccount: Controller = async (req, res) => {
    try {
        // Extract user ID from request parameters
        const { id } = req.params;

        // Check if user with the given ID exists
        const exists = await User.findByPk(id);
        if (!exists) {
            return res.status(httpCode.BAD_REQUEST).json({
                status: httpCode.BAD_REQUEST,
                message: messageConstant.INVALID_INPUT,
            });
        }

        // Delete the user
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
