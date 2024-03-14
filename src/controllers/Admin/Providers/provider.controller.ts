import {
    AccountType,
} from "../../../utils/enum.constant";
import httpCode from "../../../constants/http.constant";
import messageConstant from "../../../constants/message.constant";
import {
    User,
} from "../../../db/models/index";
import { Controller } from "../../../interfaces";
import sequelize from "sequelize";
import dotenv from "dotenv";
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
        const providerInformation = await User.findAll({
            attributes: [
                "id",
                [
                    sequelize.fn(
                        "CONCAT",
                        sequelize.col("firstName"),
                        " ",
                        sequelize.col("lastName")
                    ),
                    "Provider Name",
                ],
                ["accountType", "Role"],
                ["onCallStatus", "On Call Status"],
                ["status", "Status"],
                ["email", "Email"],
                ["phoneNumber", "Phone"],
                ["notification", "is Notification Stopped"],
            ],
            where: { accountType: AccountType.Physician },
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

// pending
export const contactProvider: Controller = async (req, res) => {
    try {
        const { messageBody, SMS, email, both } = req.body;

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
                "id",
                ["userName", "User Name"],
                ["status", "Status"],
                ["firstName", "First Name"],
                ["lastName", "Last Name"],
                ["email", "Email"],
                "phoneNumber",
                ["medicalLicense", "Medical Licence"],
                ["NPINumber", "NPI Number"],
                ["syncEmailAddress", "Synchronization Email"],
                ["address1", "Address 1"],
                ["address2", "Address 2"],
                ["city", "City"],
                ["state", "State"],
                ["zipCode", "zip"],
                ["altPhone", "Alternate Phone"],
                ["businessName", "Business Name"],
                ["businessWebsite", "Business Website"],
                ["photo", "Photo"],
                ["signature", "Signature"],
                "isAgreementDoc",
                "isBackgroundDoc",
                "isNonDisclosureDoc",
                "isLicenseDoc",
            ],
            where: { id },
        });

        return res.status(httpCode.OK).json({
            status: httpCode.OK,
            message: messageConstant.SUCCESS,
            data: physicianProfile,
        });
    } catch (error) {
        throw error;
    }
};