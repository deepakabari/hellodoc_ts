import {
    RequestStatus,
} from "../../../utils/enum.constant";
import httpCode from "../../../constants/http.constant";
import messageConstant from "../../../constants/message.constant";
import {
    Request,
} from "../../../db/models/index";
import { Controller } from "../../../interfaces";
import sequelize from "sequelize";
import dotenv from "dotenv";
dotenv.config();


/**
 * Retrieves the history of patient requests from the database.
 * @param req - The Express Request object containing the incoming request data.
 * @param res - The Express Response object used to send back the desired HTTP response.
 * @returns - A promise that resolves to the Express Response object, which sends a JSON response containing the status code, success message, and the retrieved patients' history data.
 */
export const getPatientHistory: Controller = async (req, res) => {
    try {
        const patientsHistory = await Request.findAll({
            attributes: [
                "id",
                ["patientFirstName", "First Name"],
                ["patientLastName", "Last Name"],
                ["patientEmail", "Email"],
                ["patientPhoneNumber", "Phone"],
                [
                    sequelize.fn(
                        "CONCAT",
                        sequelize.col("Request.street"),
                        ", ",
                        sequelize.col("Request.city"),
                        ", ",
                        sequelize.col("Request.state"),
                        ", ",
                        sequelize.col("Request.zipCode")
                    ),
                    "Address",
                ],
            ],
        });

        return res.status(httpCode.OK).json({
            status: httpCode.OK,
            message: messageConstant.SUCCESS,
            data: patientsHistory,
        });
    } catch (error) {
        throw error;
    }
};

/**
 * Retrieves a list of blocked requests from the database.
 * @param req - The Express Request object containing the incoming request data.
 * @param res - The Express Response object used to send back the desired HTTP response.
 * @returns - A promise that resolves to the Express Response object, which sends a JSON response containing the status code, success message, and the data of blocked requests.
 */
export const blockHistory: Controller = async (req, res) => {
    try {
        const blockRequests = await Request.findAll({
            attributes: [
                "id",
                [
                    sequelize.fn(
                        "CONCAT",
                        sequelize.col("patientFirstName"),
                        " ",
                        sequelize.col("patientLastName")
                    ),
                    "Name",
                ],
                ["patientPhoneNumber", "Phone Number"],
                ["patientEmail", "Email"],
                ["createdAt", "Created Date"],
                ["patientNote", "Notes"],
            ],
            where: { requestStatus: RequestStatus.Blocked },
        });

        return res.status(httpCode.OK).json({
            status: httpCode.OK,
            message: messageConstant.SUCCESS,
            data: blockRequests,
        });
    } catch (error) {
        throw error;
    }
};