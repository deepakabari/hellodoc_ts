import httpCode from '../../constants/http.constant';
import messageConstant from '../../constants/message.constant';
import {
    User,
    Request,
    UserRegion,
    RequestWiseFiles,
    Business,
    EmailLog,
} from '../../db/models/index';
import { Controller } from '../../interfaces';
import bcrypt from 'bcrypt';
import {
    AccountType,
    ProfileStatus,
    RequestStatus,
} from '../../utils/enum.constant';
import { CaseTag } from '../../utils/enum.constant';
import { Op } from 'sequelize';
import dotenv from 'dotenv';
import linkConstant from '../../constants/link.constant';
import { compileEmailTemplate } from '../../utils/hbsCompiler';
import { sendEmail } from '../../utils/email';
import { getAbbreviationFromDb } from '../../utils/regionAbbreviation';
dotenv.config();

const ITERATION = process.env.ITERATION;

// Get the current date
const currentDate = new Date();

const day = String(currentDate.getDate()).padStart(2, '0'); // display the date in 2 digit format
const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // display the month in 2 digit format
const year = String(currentDate.getFullYear()).padStart(2, '0');

const startOfDay = new Date();
startOfDay.setHours(0, 0, 0, 0);

const endOfDay = new Date();
endOfDay.setHours(23, 59, 59, 999);

/**
 * @function createUser
 * @param req - Express request object, expects user details in the body.
 * @param res - Express response object used to send the response.
 * @returns - Returns a Promise that resolves to an Express response object. The response contains the status code, a success message, and the created user data if the user is successfully created. If the user is not created, it returns an error message.
 * @throws - Throws an error if there's an issue in the execution of the function.
 * @description This function is an Express controller that handles user registration. It validates the request body, checks if the user already exists, hashes the password, creates the user, associates the user with regions if the account type is admin or physician, and sends the created user data in the response.
 */
const createAccount: Controller = async (req, res) => {
    try {
        const {
            accountType,
            userName,
            password,
            confirmPassword,
            firstName,
            lastName,
            email,
            confirmEmail,
            phoneNumber,
            street,
            address1,
            address2,
            city,
            state,
            zipCode,
            altPhone,
            medicalLicense,
            NPINumber,
            dob,
            roleId,
            businessName,
            businessWebsite,
            photo,
            independentContract,
            backgroundCheck,
            hpaaCompliance,
            nonDisclosureAgreement,
            notes,
        } = req.body;

        const existingUser = await User.findOne({
            where: { email },
        });

        if (existingUser) {
            return res.status(httpCode.BAD_REQUEST).json({
                status: httpCode.BAD_REQUEST,
                message: messageConstant.USER_ALREADY_EXISTS,
            });
        }

        // secure the password using bcrypt hashing algorithm
        const hashedPassword = await bcrypt.hash(password, Number(ITERATION));

        if (accountType === 'Admin') {
            if (email.localeCompare(confirmEmail) != 0) {
                return res.status(httpCode.BAD_REQUEST).json({
                    status: httpCode.BAD_REQUEST,
                    message: messageConstant.EMAIL_NOT_MATCH,
                });
            }
            const newUser = await User.create({
                accountType,
                userName,
                email,
                password: hashedPassword,
                firstName,
                lastName,
                phoneNumber,
                address1,
                address2,
                city,
                state,
                zipCode,
                altPhone,
                roleId,
                status: ProfileStatus.Active,
                createdBy: req.user.id,
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            if (!newUser) {
                return res.status(httpCode.BAD_REQUEST).json({
                    status: httpCode.BAD_REQUEST,
                    message: messageConstant.USER_CREATION_FAILED,
                });
            } else {
                const { regions } = req.body;

                // Create UserRegion instances for each region
                for (const regionId of regions) {
                    await UserRegion.create({
                        userId: newUser.id,
                        regionId,
                    });
                }

                // Omit the sensitive information from response
                const {
                    password,
                    street,
                    city,
                    state,
                    zipCode,
                    dob,
                    ...userResponse
                } = newUser.get({ plain: true });

                return res.status(httpCode.OK).json({
                    status: httpCode.OK,
                    message: messageConstant.SUCCESS,
                    data: userResponse,
                });
            }
        } else if (accountType === 'Physician') {
            const newUser = await User.create({
                accountType,
                userName,
                firstName,
                lastName,
                email,
                password: hashedPassword,
                phoneNumber,
                address1,
                address2,
                city,
                state,
                zipCode,
                altPhone,
                medicalLicense,
                NPINumber,
                roleId,
                notes,
                status: ProfileStatus.Active,
                createdBy: req.user.id,
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            if (!newUser) {
                return res.status(httpCode.BAD_REQUEST).json({
                    status: httpCode.BAD_REQUEST,
                    message: messageConstant.USER_CREATION_FAILED,
                });
            } else {
                const newBusiness = await Business.create({
                    accountType: AccountType.Vendor,
                    userId: newUser.id,
                    businessName,
                    businessWebsite,
                    phoneNumber,
                    email,
                    street: address1,
                    city,
                    state,
                    zipCode,
                });

                const fileColumnMapping: { [key: string]: string } = {
                    photo: 'photo',
                    signature: 'signature',
                    backgroundCheck: 'isBackgroundDoc',
                    nonDisclosureAgreement: 'isNonDisclosureDoc',
                    hipaaCompliance: 'isHipaaDoc',
                    independentContract: 'isAgreementDoc',
                };

                const uploadedFiles: { [key: string]: string[] } = {};

                const updateFields: { [key: string]: boolean } = {};

                let files: { [key: string]: Express.Multer.File[] } = {};

                // If req.files is an object, assign it directly
                files = req.files as {
                    [key: string]: Express.Multer.File[];
                };

                for (const fieldName of Object.keys(fileColumnMapping)) {
                    const fieldFiles = files[fieldName];
                    if (fieldFiles && fieldFiles.length > 0) {
                        // Update corresponding column in the user table
                        const columnName = fileColumnMapping[fieldName];
                        updateFields[columnName] = true;

                        // Save file details to RequestWiseFiles table
                        for (const file of fieldFiles) {
                            await RequestWiseFiles.create({
                                userId: newUser.id,
                                fileName: file.filename,
                                docType: fieldName,
                                documentPath: file.path,
                                createdAt: new Date(),
                                updatedAt: new Date(),
                            });
                        }
                        uploadedFiles[fieldName] = fieldFiles.map(
                            (file) => file.filename,
                        );
                    }
                }

                await User.update(updateFields, {
                    where: { id: newUser.id }, // Update based on user id
                });

                const { regions } = req.body;

                // Create UserRegion instances for each region
                for (const regionId of regions) {
                    await UserRegion.create({
                        userId: newUser.id,
                        regionId,
                    });
                }

                // Omit the sensitive information from response
                const { password, dob, ...userResponse } = newUser.get({
                    plain: true,
                });

                return res.status(httpCode.OK).json({
                    status: httpCode.OK,
                    message: messageConstant.USER_CREATED,
                    data: { userResponse, newBusiness, uploadedFiles },
                });
            }
        } else {
            return res.status(httpCode.BAD_REQUEST).json({
                status: httpCode.BAD_REQUEST,
                message: messageConstant.BAD_REQUEST,
            });
        }
    } catch (error: any) {
        // If an error occurs, check if it's a SequelizeUniqueConstraintError
        if (error.name === 'SequelizeUniqueConstraintError') {
            // Send a custom error message
            return res.status(httpCode.CONFLICT).json({
                status: httpCode.CONFLICT,
                message: messageConstant.UNIQUE_CONSTRAINT,
            });
        } else {
            // For other types of errors, send a generic error message
            return res.status(httpCode.INTERNAL_SERVER_ERROR).json({
                status: httpCode.INTERNAL_SERVER_ERROR,
                message: messageConstant.INTERNAL_SERVER_ERROR,
            });
        }
    }
};

const createPatient: Controller = async (req, res) => {
    try {
        const { email, password, confirmPassword } = req.body;

        const existingUser = await User.findOne({ where: { email } });
        if (!existingUser) {
            return res.status(httpCode.BAD_REQUEST).json({
                status: httpCode.BAD_REQUEST,
                message: messageConstant.USER_NOT_EXIST,
            });
        }

        // secure the password using bcrypt hashing algorithm
        const hashedPassword = await bcrypt.hash(password, Number(ITERATION));

        if (password.localeCompare(confirmPassword) != 0) {
            return res.status(httpCode.BAD_REQUEST).json({
                status: httpCode.BAD_REQUEST,
                message: messageConstant.PASSWORD_NOT_MATCH,
            });
        }

        const userName = email.substring(0, email.indexOf('@'));
        const newUser = await User.update(
            {
                email,
                userName,
                password: hashedPassword,
                status: ProfileStatus.Active,
                updatedAt: new Date(),
            },
            {
                where: { email },
            },
        );

        if (!newUser) {
            return res.status(httpCode.BAD_REQUEST).json({
                status: httpCode.BAD_REQUEST,
                message: messageConstant.USER_CREATION_FAILED,
            });
        }

        return res.status(httpCode.OK).json({
            status: httpCode.OK,
            message: messageConstant.USER_CREATED,
        });
    } catch (error) {
        throw error;
    }
};

/**
 * @function isEmailFound
 * @param req - Express request object, expects `patientEmail` in the body.
 * @param res - Express response object used to send the response.
 * @returns - Returns a Promise that resolves to an Express response object. The response contains the status code and a boolean indicating whether the email exists in the database.
 * @throws - Throws an error if there's an issue in the execution of the function.
 * @description This function is an Express controller that checks if a patient's email exists in the database. It sends a boolean in the response indicating whether the email exists.
 */
const isEmailFound: Controller = async (req, res) => {
    try {
        // get patient email from request body
        const { patientEmail } = req.body;

        // check if user exists in the database
        const existingUser = await User.findOne({
            where: { email: patientEmail },
        });

        return res.status(httpCode.OK).json({ data: !!existingUser });
        // any error generated then give error message
    } catch (error: any) {
        throw error;
    }
};

/**
 * @function createRequest
 * @param req - Express request object, expects user details and a file in the body.
 * @param res - Express response object used to send the response.
 * @returns - Returns a Promise that resolves to an Express response object. The response contains the status code, a success message, and the created request data if the request is successfully created. If the request is not created, it returns an error message.
 * @throws - Throws an error if there's an issue in the execution of the function.
 * @description This function is an Express controller that handles request creation. It validates the request body, checks if the user already exists, hashes the password, creates the user if they don't exist, generates a confirmation number, creates the request, uploads the document, and sends the created request data in the response.
 */
const createRequest: Controller = async (req, res) => {
    try {
        const {
            requestType,
            patientFirstName,
            patientLastName,
            patientEmail,
            password,
            isEmail,
            patientPhoneNumber,
            state,
            caseNumber,
        } = req.body;

        if (requestType === 'Patient') {
            req.body = {
                ...req.body,
                requestorFirstName: patientFirstName,
                requestorLastName: patientLastName,
                requestorEmail: patientEmail,
                requestorPhoneNumber: patientPhoneNumber,
            };
        }

        let userId: number | null;

        if (!isEmail) {
            // hash the password
            const hashedPassword =
                requestType === 'Patient'
                    ? await bcrypt.hash(password, Number(ITERATION))
                    : null;

            const userStatus =
                requestType === 'Patient'
                    ? ProfileStatus.Active
                    : ProfileStatus.Pending;

            if (req.user) {
                userId = req.user.id;
            } else {
                // create a user with the given email
                const user = await User.create({
                    ...req.body,
                    status: userStatus,
                    userName: patientFirstName,
                    email: patientEmail,
                    firstName: patientFirstName,
                    lastName: patientLastName,
                    phoneNumber: patientPhoneNumber,
                    password: hashedPassword,
                    accountType: AccountType.User,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                });
                // get the user id from the user object
                userId = user.id;
            }

            if (requestType !== 'Patient' || !!isEmail) {
                const templateData = {
                    createAccountLink: linkConstant.CREATE_ACCOUNT_URL,
                    patientName: patientFirstName + ' ' + patientLastName,
                };

                const data = await compileEmailTemplate(
                    'createAccountEmail',
                    templateData,
                );

                sendEmail({
                    to: patientEmail,
                    subject: linkConstant.createAccountSubject,
                    html: data,
                });

                await EmailLog.create({
                    email: patientEmail,
                    senderId: userId,
                    receiverId: userId,
                    sentDate: new Date(),
                    isEmailSent: true,
                    sentTries: 1,
                    action: 'Create Request',
                });
            }
        } else {
            const existingUser = await User.findOne({
                where: { email: patientEmail },
            });
            userId = existingUser ? existingUser.id : null;
        }

        const regionAbbreviation = await getAbbreviationFromDb(state);

        let requestCount = await Request.count({
            where: {
                createdAt: {
                    [Op.between]: [startOfDay, endOfDay],
                },
            },
        });
        let requestCountStr = String(requestCount + 1).padStart(4, '0');

        // Generate the confirmation number
        const confirmationNumber = `${regionAbbreviation}${
            day + month + year
        }${patientLastName.slice(0, 2).toUpperCase()}${patientFirstName
            .slice(0, 2)
            .toUpperCase()}${requestCountStr}`;

        // create a new patient request
        const newRequest = await Request.create({
            userId,
            requestStatus: RequestStatus.Unassigned,
            caseTag: CaseTag.New,
            confirmationNumber,
            isDeleted: false,
            ...req.body,
            caseNumber,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        let documentUpload;

        if (req.file) {
            documentUpload = await RequestWiseFiles.create({
                requestId: newRequest.id,
                userId: userId as number,
                fileName: req.file.originalname,
                documentPath: req.file.path,
                docType: 'MedicalReport',
                createdAt: new Date(),
                updatedAt: new Date(),
            });
        }

        // if request successfully created then give success message
        return res.status(httpCode.OK).json({
            status: httpCode.OK,
            message: messageConstant.REQUEST_CREATED,
            data: { newRequest, documentUpload },
        });
        // any error generated then give error message
    } catch (error: any) {
        throw error;
    }
};

/**
 * @function createAdminRequest
 * @param req - Express request object, expects user details and a file in the body.
 * @param res - Express response object used to send the response.
 * @returns - Returns a Promise that resolves to an Express response object. The response contains the status code, a success message, and the created request data if the request is successfully created. If the request is not created, it returns an error message.
 * @throws - Throws an error if there's an issue in the execution of the function.
 * @description This function is an Express controller that handles request creation. It validates the request body, checks if the user already exists, hashes the password, creates the user if they don't exist, generates a confirmation number, creates the request, uploads the document, and sends the created request data in the response.
 */
const createAdminRequest: Controller = async (req, res) => {
    try {
        const {
            requestType,
            patientFirstName,
            patientLastName,
            patientEmail,
            isEmail,
            patientPhoneNumber,
            state,
        } = req.body;

        if (
            requestType === 'Admin' ||
            requestType === 'Physician' ||
            requestType === 'Patient'
        ) {
            req.body = {
                ...req.body,
                requestorFirstName: req.user.firstName,
                requestorLastName: req.user.lastName,
                requestorEmail: req.user.email,
                requestorPhoneNumber: req.user.phoneNumber,
            };
        }

        let userId;

        if (!isEmail) {
            // create a user with the given email
            const user = await User.create({
                ...req.body,
                status: ProfileStatus.Pending,
                userName: patientFirstName,
                email: patientEmail,
                firstName: patientFirstName,
                lastName: patientLastName,
                phoneNumber: patientPhoneNumber,
                password: null,
                accountType: AccountType.User,
                createdAt: new Date(),
                updatedAt: new Date(),
            });
            // get the user id from the user object
            userId = user.id;

            if (requestType !== 'Patient' || !!isEmail) {
                const templateData = {
                    createAccountLink: linkConstant.CREATE_ACCOUNT_URL,
                    patientName: patientFirstName + ' ' + patientLastName,
                };

                const data = await compileEmailTemplate(
                    'createAccountEmail',
                    templateData,
                );

                sendEmail({
                    to: patientEmail,
                    subject: linkConstant.createAccountSubject,
                    html: data,
                });

                await EmailLog.create({
                    email: patientEmail,
                    senderId: user.id,
                    receiverId: user.id,
                    sentDate: new Date(),
                    isEmailSent: true,
                    sentTries: 1,
                    action: 'Create Request',
                });
            }
        } else {
            const existingUser = await User.findOne({
                where: { email: patientEmail },
            });
            userId = existingUser ? existingUser.id : null;
        }

        const regionAbbreviation = await getAbbreviationFromDb(state);

        let requestCount = await Request.count({
            where: {
                createdAt: {
                    [Op.between]: [startOfDay, endOfDay],
                },
            },
        });
        let requestCountStr = String(requestCount + 1).padStart(4, '0');

        // Generate the confirmation number
        const confirmationNumber = `${regionAbbreviation}${
            day + month + year
        }${patientLastName.slice(0, 2).toUpperCase()}${patientFirstName
            .slice(0, 2)
            .toUpperCase()}${requestCountStr}`;

        let physicianId, requestStatus, caseTag;
        if (requestType === 'Physician') {
            physicianId = req.user.id;
            requestStatus = RequestStatus.Accepted;
            caseTag = CaseTag.Pending;
        } else {
            requestStatus = RequestStatus.Unassigned;
            caseTag = CaseTag.New;
        }

        // create a new patient request
        const newRequest = await Request.create({
            userId,
            requestStatus,
            caseTag,
            confirmationNumber,
            isDeleted: false,
            physicianId,
            ...req.body,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        let documentUpload;

        if (req.file) {
            documentUpload = await RequestWiseFiles.create({
                requestId: newRequest.id,
                userId: userId as number,
                fileName: req.file.originalname,
                documentPath: req.file.path,
                docType: 'MedicalReport',
                createdAt: new Date(),
                updatedAt: new Date(),
            });
        }

        // if request successfully created then give success message
        return res.status(httpCode.OK).json({
            status: httpCode.OK,
            message: messageConstant.REQUEST_CREATED,
            data: { newRequest, documentUpload },
        });
    } catch (error) {
        throw error;
    }
};

export default {
    createAccount,
    createPatient,
    createRequest,
    isEmailFound,
    createAdminRequest,
};
