import AppError from "../utils/errorHandler";
import httpCode from "../constants/http.constant";
import messageConstant from "../constants/message.constant";
import { User, Request } from "../db/models/index";
import { Controller } from "../interfaces";
import bcrypt from "bcrypt";
import { AccountType } from "../utils/enum.constant";
import userSchema from "../validations/user.valid";
import dotenv from "dotenv";
import requestSchema from "../validations/request.valid";
import { CaseTag } from "../utils/enum.constant";
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

        // hash the password
        const hashedPassword = await bcrypt.hash(password, Number(ITERATION));

        // find or create a user with the given email
        const [user, created] = await User.findOrCreate({
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

        // if user is created, send a success message
        if (!created) {
            throw new Error(messageConstant.USER_CREATION_FAILED);
        }
        let caseTag = CaseTag.New;

        // create a new patient request
        const newRequest = await Request.create({
            userId,
            caseTag,
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
