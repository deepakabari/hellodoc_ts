import httpCode from '../../constants/http.constant';
import messageConstant from '../../constants/message.constant';
import {
    User,
    Request,
    UserRegion,
    RequestWiseFiles,
    Region,
    Business,
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
dotenv.config();

const ITERATION = process.env.ITERATION;

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
            businessName,
            businessWebsite,
            photo,
            independentContract,
            backgroundCheck,
            hpaaCompliance,
            nonDisclosureAgreement,
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
                status: ProfileStatus.Active,
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
                        createdAt: new Date(),
                        updatedAt: new Date(),
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
            const files = (req.files as Express.Multer.File[]) || [];

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
                status: ProfileStatus.Active,
                createdAt: new Date(),
                updatedAt: new Date(),
                isBackgroundDoc: !!(req.files as Express.Multer.File[])?.find(
                    (file) => file.fieldname === 'backgroundCheck',
                ),
                isAgreementDoc: !!(req.files as Express.Multer.File[])?.find(
                    (file) => file.fieldname === 'independentContract',
                ),
                isTrainingDoc: !!(req.files as Express.Multer.File[])?.find(
                    (file) => file.fieldname === 'hpaaCompliance',
                ),
                isNonDisclosureDoc: !!(
                    req.files as Express.Multer.File[]
                )?.find((file) => file.fieldname === 'nonDisclosureAgreement'),
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
                const documentTypeMap: { [key: string]: string } = {
                    photo: 'Photo',
                    independentContract: 'IndependentContract',
                    backgroundCheck: 'BackgroundCheck',
                    hpaaCompliance: 'HPAACompliance',
                    nonDisclosureAgreement: 'NonDisclosureAgreement',
                };

                const filePromises = files.map((file: any) => {
                    const docType =
                        documentTypeMap[file.fieldname] || 'unknown';

                    return RequestWiseFiles.create({
                        requestId: newUser.id,
                        fileName: file.originalname,
                        documentPath: file.path,
                        docType,
                    });
                });
                const newFiles = await Promise.all(filePromises);

                const { regions } = req.body;

                // Create UserRegion instances for each region
                for (const regionId of regions) {
                    await UserRegion.create({
                        userId: newUser.id,
                        regionId,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    });
                }

                // Omit the sensitive information from response
                const { password, dob, ...userResponse } = newUser.get({
                    plain: true,
                });

                return res.status(httpCode.OK).json({
                    status: httpCode.OK,
                    message: messageConstant.USER_CREATED,
                    data: { userResponse, newFiles, newBusiness },
                });
            }
        } else if (accountType === 'User') {
            if (password.localeCompare(confirmPassword) != 0) {
                return res.status(httpCode.BAD_REQUEST).json({
                    status: httpCode.BAD_REQUEST,
                    message: messageConstant.PASSWORD_NOT_MATCH,
                });
            }
            const userName = email.substring(0, email.indexOf('@'));
            const newUser = await User.create({
                email,
                userName,
                password: hashedPassword,
                status: ProfileStatus.Active,
                createdAt: new Date(),
                updatedAt: new Date(),
            });

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
        } else {
            return res.status(httpCode.BAD_REQUEST).json({
                status: httpCode.BAD_REQUEST,
                message: messageConstant.BAD_REQUEST,
            });
        }
    } catch (error) {
        console.log('Catch:', error);
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
        } = req.body;

        if (!req.file) {
            throw new Error(messageConstant.IMAGE_NOT_UPLOADED);
        }

        if(requestType === 'Patient') {
            req.body = {
                ...req.body,
                requestorFirstName: patientFirstName,
                requestorLastName: patientLastName,
                requestorEmail: patientEmail,
                requestorPhoneNumber: patientPhoneNumber
            }

        }
        let userId;

        if (!isEmail) {
            // hash the password
            const hashedPassword = await bcrypt.hash(
                password,
                Number(ITERATION),
            );

            // find or create a user with the given email
            const user = await User.create({
                ...req.body,
                status: ProfileStatus.Active,
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
        } else {
            const existingUser = await User.findOne({
                where: { email: patientEmail },
            });
            userId = existingUser ? existingUser.id : null;
        }

        // Get the current date
        const currentDate = new Date();

        // generate the abbreviation of given state for confirmation number
        async function getAbbreviationFromDb(
            name: string,
        ): Promise<string | undefined> {
            try {
                const regionEntry = await Region.findOne({
                    where: { name },
                });
                return regionEntry ? regionEntry?.abbreviation : undefined;
            } catch (error) {
                throw error;
            }
        }

        const regionAbbreviation = await getAbbreviationFromDb(state);

        const day = String(currentDate.getDate()).padStart(2, '0'); // display the date in 2 digit format
        const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // display the month in 2 digit format

        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

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
            day + month
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
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        const documentUpload = await RequestWiseFiles.create({
            requestId: newRequest.id,
            fileName: req.file.originalname,
            documentPath: req.file.path,
            docType: 'MedicalReport',
        });

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

export default {
    createAccount,
    createRequest,
    isEmailFound,
};