import AppError from "../utils/errorHandler";
import httpCode from "../constants/http.constant";
import messageConstant from "../constants/message.constant";
import { Request } from "../db/models/index";
import { Controller } from "../interfaces";
import dotenv from "dotenv";
import sequelize from "sequelize";
dotenv.config();

export const getNewPatient: Controller = async (req, res) => {
    try {
        // sequelize query to get patient information
        const newPatient = await Request.findAll({
            attributes: [
                [
                    sequelize.fn(
                        "CONCAT",
                        sequelize.col("patientFirstName"),
                        " ",
                        sequelize.col("patientLastName")
                    ),
                    "Name",
                ],
                ["dob", "Date Of Birth"],
                [
                    sequelize.fn(
                        "CONCAT",
                        sequelize.col("requestType"),
                        " ",
                        sequelize.col("requestorFirstName"),
                        " ",
                        sequelize.col("requestorLastName")
                    ),
                    "Requestor",
                ],
                ["createdAt", "Requested Date"],
                ["patientPhoneNumber", "Phone"],
                [
                    sequelize.fn(
                        "CONCAT",
                        sequelize.col("street"),
                        ", ",
                        sequelize.col("city"),
                        ", ",
                        sequelize.col("state"),
                        ", ",
                        sequelize.col("zipCode")
                    ),
                    "Address",
                ],
                ["patientNote", "Notes"],
            ],
            where: {
                caseTag: "New",
                deletedAt: null,
            },
        });

        return res.json({
            status: httpCode.OK,
            message: messageConstant.SUCCESS,
            data: newPatient,
        });
    } catch (error: any) {
        throw error;
    }
};
