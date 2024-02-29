import AppError from "../utils/errorHandler";
import httpCode from "../constants/http.constant";
import messageConstant from "../constants/message.constant";
import { User, Request } from "../db/models/index";
import { Controller } from "../interfaces";
import bcrypt from "bcrypt";
import {
    AccountType,
    ProfileStatus,
    RequestType,
} from "../utils/enum.constant";
import userSchema from "../validations/user.valid";
import dotenv from "dotenv";
dotenv.config();

const ITERATION = process.env.ITERATION;

export const createUser: Controller = async (req, res) => {
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
            return res.json({
                status: httpCode.OK,
                message: messageConstant.USER_CREATED,
                data: newUser,
            });
            // otherwise give error message
        } else {
            throw new Error("Failed to create user account.");
        }
        // any error generated above then give error message
    } catch (error: any) {
        return AppError(error, req, res);
    }
};

export const isEmailFound: Controller = async (req, res) => {
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
        return AppError(error, req, res);
    }
};

export const createRequest: Controller = async (req, res) => {
    try {
        const {
            requestorFirstName,
            requestorLastName,
            requestorPhoneNumber,
            requestorEmail,
            relationName,
            patientFirstName,
            patientLastName,
            patientEmail,
            patientPhoneNumber,
            street,
            dob,
            city,
            state,
            zipCode,
        } = req.body;

        const existingUser = await User.findOne({
            where: { email: patientEmail },
        });
        
        let requestType = RequestType.Family;
        let status = ProfileStatus.Active;
        
        // if email is not found then create a new user
        if (!existingUser) {
            const { password } = req.body;
            const hashedPassword = await bcrypt.hash(
                password,
                Number(ITERATION)
            );

            const newUser = await User.create({
                userName: patientFirstName,
                password: hashedPassword,
                firstName: patientFirstName,
                lastName: patientLastName,
                email: patientEmail,
                phoneNumber: patientPhoneNumber,
                street,
                city,
                state,
                zipCode,
                dob,
                accountType: AccountType.User,
                createdAt: new Date(),
                updatedAt: new Date(),
            });
            // if user is successfully created then give success message
            if (newUser) {
                return res.json({
                    status: httpCode.OK,
                    message: messageConstant.USER_CREATED,
                    data: newUser,
                });
                // otherwise give error message
            } else {
                throw new Error("Failed to create account.");
            }
        }
        // create a new patient request
        const newRequest = await Request.create({
            requestType,
            userId: 1,
            requestorFirstName,
            requestorLastName,
            requestorPhoneNumber,
            requestorEmail,
            relationName,
            patientFirstName,
            patientLastName,
            patientEmail,
            patientPhoneNumber,
            status,
            dob,
            street,
            city,
            state,
            zipCode,
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
        return AppError(error, req, res);
    }
};
