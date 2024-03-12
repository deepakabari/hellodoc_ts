import httpCode from "../constants/http.constant";
import messageConstant from "../constants/message.constant";
import jwt from "jsonwebtoken";
import transporter from "../utils/email";
import { Controller } from "../interfaces";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import bcrypt from "bcrypt";
import { Op } from "sequelize";
import { User } from "../db/models/index";
import * as exphbs from "express-handlebars";
import dotenv from "dotenv";
dotenv.config();

const SECRET = process.env.SECRET;
const EXPIRESIN = process.env.EXPIRESIN;
const ITERATION = process.env.ITERATION;
const EMAIL_FROM = process.env.EMAIL_FROM;
const RANDOMBYTES = process.env.RANDOMBYTES;

/**
 * @function login
 * @param req - Express request object, expects `email` and `password` in the body.
 * @param res - Express response object used to send the response.
 * @returns - Returns a Promise that resolves to an Express response object. The response contains the status code, a success message, and a token if the login is successful. If the login is not successful, it returns an error message.
 * @throws - Throws an error if there's an issue in the execution of the function.
 * @description This function is an Express controller that handles user login. It validates the request body, checks if the user exists, verifies the password, and if everything is valid, it generates a JWT token and sends it in the response.
 */
export const login: Controller = async (req, res) => {
    try {

        // Extract email and password from request body
        const { email, password } = req.body;

        // Find user in database
        const user = await User.findOne({
            where: { email },
        });

        // if user not found then give an error
        if (!user) {
            return res.status(httpCode.UNAUTHORIZED).json({
                status: httpCode.UNAUTHORIZED,
                message: messageConstant.USER_NOT_EXIST,
            });
        }

        // Check if password matches
        const isPasswordMatch = await bcrypt.compare(password, user.password);

        // if password matches with the password stored in the database then generate a new access token
        if (isPasswordMatch) {
            const token = jwt.sign(
                {
                    id: user.id,
                    userName: user.userName,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    phoneNumber: user.phoneNumber,
                },
                SECRET as string,
                {
                    expiresIn: EXPIRESIN,
                }
            );

            return res.json({
                status: httpCode.OK,
                message: messageConstant.SUCCESS,
                token,
            });
        } else {
            return res.status(httpCode.UNAUTHORIZED).json({
                status: httpCode.UNAUTHORIZED,
                message: messageConstant.WRONG_PASSWORD,
            });
        }
    } catch (error: any) {
        throw error;
    }
};

/**
 * @function forgotPassword
 * @param req - Express request object, expects `email` in the body.
 * @param res - Express response object used to send the response.
 * @returns - Returns a Promise that resolves to an Express response object. The response contains the status code, a success message, and a token if the password reset email is successfully sent. If the email is not sent, it returns an error message.
 * @throws - Throws an error if there's an issue in the execution of the function.
 * @description This function is an Express controller that handles the password reset process. It validates the request body, checks if the user exists, generates a reset token, sends a password reset email to the user, and sends a success response with the reset token.
 */
export const forgotPassword: Controller = async (req, res) => {
    try {
        // Extract email from request body
        const { email } = req.body;

        // Check if user exists in the database
        const existingUser = await User.findOne({
            where: { email },
        });

        // if user not found then give an error
        if (!existingUser) {
            return res.status(httpCode.UNAUTHORIZED).json({
                status: httpCode.UNAUTHORIZED,
                message: messageConstant.USER_NOT_EXIST,
            });
        }

        // Generate a reset token
        const hashedToken = crypto
            .randomBytes(Number(RANDOMBYTES))
            .toString("hex");

        // Check if the token was successfully generated
        if (!hashedToken) {
            return res.status(httpCode.BAD_GATEWAY).json({
                status: httpCode.BAD_GATEWAY,
                message: messageConstant.NOT_GET_HASHED_TOKEN,
            });
        }

        // create an instance of expireToken
        let expireToken = new Date();

        // set the expire token time to 60 minutes
        expireToken.setMinutes(expireToken.getMinutes() + 60);

        // update the resetToken and expireToken to the Admin table
        await User.update(
            {
                resetToken: hashedToken,
                expireToken,
            },
            { where: { email } }
        );

        const resetLink = `http://localhost:3000/auth/resetPassword/${hashedToken}`;

        // Read template file
        const data = await new Promise((resolve) => {
            console.log(__dirname);
            fs.readFile(
                path.join(__dirname, "..", "public", "templates", "resetEmail.hbs"),
                "utf8",
                (err, hbsFile) => {
                    if (err) {
                        console.error(err);
                        return;
                    }
                    const hbs = exphbs.create({
                        extname: "hbs",
                        defaultLayout: false,
                    }).handlebars;

                    // Compile template with reset link
                    const template = hbs.compile(hbsFile, {});
                    const htmlToSend = template({
                        reset_url: resetLink,
                    });
                    resolve(htmlToSend);
                }
            );
        });

        const mailOptions = {
            from: EMAIL_FROM,
            to: email,
            subject: "Password Reset Email",
            html: data,
        };

        return transporter.sendMail(mailOptions, (error: Error) => {
            if (error) {
                throw error;
            } else {
                console.log("Email sent: " + resetLink);
                return res.json({
                    status: httpCode.OK,
                    message: messageConstant.RESET_EMAIL_SENT,
                    data: { token: hashedToken }, // it is only for testing purpose
                });
            }
        });
    } catch (error: any) {
        throw error;
    }
};

/**
 * @function resetPassword
 * @param req - Express request object, expects `newPassword` and `confirmPassword` in the body, and `hash` in the parameters.
 * @param res - Express response object used to send the response.
 * @returns - Returns a Promise that resolves to an Express response object. The response contains the status code and a success message if the password is successfully reset. If the password is not reset, it returns an error message.
 * @throws - Throws an error if there's an issue in the execution of the function.
 * @description This function is an Express controller that handles password reset. It validates the request body, checks if the user exists and the reset token is valid, and if everything is valid, it resets the user's password and sends a success response.
 */
export const resetPassword: Controller = async (req, res) => {
    try {
        
        // Extract email, new password, and confirm password from request body
        const { newPassword, confirmPassword } = req.body;
        const { hash } = req.params;

        // Find user in database with matching email and reset token
        const user = await User.findOne({
            where: {
                resetToken: hash,
                expireToken: { [Op.gt]: new Date() }, // Ensure that the reset token is not expired
            },
        });

        // if user not found then give an error of unauthorized
        if (!user) {
            return res.status(httpCode.UNAUTHORIZED).json({
                status: httpCode.UNAUTHORIZED,
                message: messageConstant.INVALID_RESET_TOKEN,
            });
        }

        // Check if newPassword matches confirmPassword
        if (newPassword.localeCompare(confirmPassword) != 0) {
            return res.status(httpCode.BAD_REQUEST).json({
                status: httpCode.BAD_REQUEST,
                message: messageConstant.PASSWORD_NOT_MATCH,
            });
        }

        // Hash the new Password
        const hashedPassword = await bcrypt.hash(
            newPassword,
            Number(ITERATION)
        );

        // Update user's password, resetToken, and expireToken
        await User.update(
            {
                password: hashedPassword,
                resetToken: null,
                expireToken: null,
            },
            { where: { resetToken: hash } }
        );

        // return success response if password was updated
        return res.json({
            status: httpCode.OK,
            message: messageConstant.PASSWORD_RESET,
        });
    } catch (error: any) {
        throw error;
    }
};
