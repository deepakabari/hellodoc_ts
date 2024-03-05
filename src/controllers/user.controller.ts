import httpCode from "../constants/http.constant";
import messageConstant from "../constants/message.constant";
import { User, Request } from "../db/models/index";
import { Controller } from "../interfaces";
import bcrypt from "bcrypt";
import { AccountType, ProfileStatus, RegionAbbreviation } from "../utils/enum.constant";
import userSchema from "../validations/user.valid";
import dotenv from "dotenv";
import requestSchema from "../validations/request.valid";
import { CaseTag } from "../utils/enum.constant";
import { Op } from "sequelize";

dotenv.config();

const ITERATION = process.env.ITERATION;
//
const createUser: Controller = async (req, res) => {
    try {
        // check the given data is valid
        const { error } = userSchema.validate(req.body);
        if (error) {
            return res.status(httpCode.UNPROCESSABLE_CONTENT).json({
                status: httpCode.UNPROCESSABLE_CONTENT,
                message: error,
            });
        }

        const {
            userName,
            password,
            firstName,
            lastName,
            email,
            phoneNumber,
            street,
            city,
            state,
            zipCode,
            dob,
        } = req.body;

        let accountType = AccountType.User;
        let status = ProfileStatus.Active;

        // check if user is exists in the database
        const existingUser = await User.findOne({
            where: { email },
        });

        // if exists then give error response
        if (existingUser) {
            return res.status(httpCode.CONFLICT).json({
                status: httpCode.CONFLICT,
                message: messageConstant.USER_ALREADY_EXISTS,
            });
        }

        // secure the password using bcrypt hashing algorithm
        const hashedPassword = await bcrypt.hash(password, Number(ITERATION));

        // create the user and store it in the database
        const newUser = await User.create({
            userName,
            password: hashedPassword,
            firstName,
            lastName,
            email,
            phoneNumber,
            status,
            street,
            city,
            state,
            zipCode,
            dob,
            accountType,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        // if newUser successfully created then give success message
        if (newUser) {
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

            return res.json({
                status: httpCode.OK,
                message: messageConstant.USER_CREATED,
                data: userResponse,
            });
            // otherwise give error message
        } else {
            throw new Error(messageConstant.USER_CREATION_FAILED);
        }
        // any error generated above then give error message
    } catch (error) {
        console.log("Catch:", error);
        throw error;
    }
};

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

const createRequest: Controller = async (req, res) => {
    try {
        // check the given data is valid
        const { error } = requestSchema.validate(req.body);
        if (error) {
            return res.status(httpCode.UNPROCESSABLE_CONTENT).json({
                status: httpCode.UNPROCESSABLE_CONTENT,
                message: error,
            });
        }
        const {
            requestType, // value comes from the frontend
            requestStatus,
            requestorFirstName,
            requestorLastName,
            requestorPhoneNumber,
            requestorEmail,
            relationName,
            patientFirstName,
            patientLastName,
            patientEmail,
            password,
            patientPhoneNumber,
            status,
            street,
            dob,
            city,
            state,
            zipCode,
            roomNumber,
        } = req.body;

        if (!req.file) {
            throw new Error(messageConstant.IMAGE_NOT_UPLOADED)
        }
        const documentPhoto: string | undefined = req.file?.path;

        // hash the password
        const hashedPassword = await bcrypt.hash(password, Number(ITERATION));

        // find or create a user with the given email
        const [user] = await User.findOrCreate({
            where: { email: patientEmail },
            defaults: {
                ...req.body,
                userName: patientFirstName,
                email: patientEmail,
                firstName: patientFirstName,
                phoneNumber: patientPhoneNumber,
                password: hashedPassword,
                accountType: AccountType.User,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        });

        // get the user id from the user object
        const userId = user.id;

        let caseTag = CaseTag.New;

        // Get the current date
        const currentDate = new Date();

        // const createAbbreviation = (cityName: string): string => {
        //     return cityName.slice(0, 2).toUpperCase();
        // };

        function getAbbreviation(
            state: keyof typeof RegionAbbreviation
        ): string | undefined {
            return RegionAbbreviation[state];
        }

        const regionAbbreviation = getAbbreviation(state);
        const day = String(currentDate.getDate()).padStart(2, "0");
        const month = String(currentDate.getMonth() + 1).padStart(2, "0");

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
        let requestCountStr = String(requestCount + 1).padStart(4, "0");

        // Generate the confirmation number
        const confirmationNumber = `${regionAbbreviation}${day + month}${patientLastName.slice(0, 2).toUpperCase()}${patientFirstName.slice(0, 2).toUpperCase()}${requestCountStr}`;

        // create a new patient request
        const newRequest = await Request.create({
            userId,
            caseTag,
            documentPhoto,
            confirmationNumber,
            ...req.body,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        // if request successfully created then give success message
        return res.status(httpCode.OK).json({
            status: httpCode.OK,
            message: messageConstant.REQUEST_CREATED,
            data: newRequest,
        });
        // any error generated then give error message
    } catch (error: any) {
        throw error;
    }
};

export default {
    createUser,
    createRequest,
    isEmailFound,
};
