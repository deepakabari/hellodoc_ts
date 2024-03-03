import AppError from "../utils/errorHandler";
import httpCode from "../constants/http.constant";
import messageConstant from "../constants/message.constant";
import { Request, User } from "../db/models/index";
import { Controller } from "../interfaces";
import dotenv from "dotenv";
import sequelize from "sequelize";
import { Op } from "sequelize";
dotenv.config();

type State = "new" | "pending" | "active" | "conclude" | "close" | "unpaid";

export const getNewPatient: Controller = async (req, res) => {
    try {
        const state = req.params.state as State;
        // sequelize query to get patient information
        const stateOptions = {
            new: {
                attributes: [
                    [
                        sequelize.fn(
                            "CONCAT",
                            sequelize.col("patientFirstName"),
                            " ",
                            sequelize.col("patientLastName"),
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
                            sequelize.col("requestorLastName"),
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
                            sequelize.col("zipCode"),
                        ),
                        "Address",
                    ],
                    ["patientNote", "Notes"],
                ],
                where: {
                    caseTag: "New",
                    deletedAt: null,
                },
            },
            pending: {
                attributes: [
                    [
                        sequelize.fn(
                            "CONCAT",
                            sequelize.col("patientFirstName"),
                            " ",
                            sequelize.col("patientLastName"),
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
                            sequelize.col("requestorLastName"),
                        ),
                        "Requestor",
                    ],
                    [
                        sequelize.fn(
                            "CONCAT",
                            sequelize.col("User.firstName"),
                            " ",
                            sequelize.col("User.lastName"),
                        ),
                        "Physician Name",
                    ],
                    ["updatedAt", "Date Of Service"],
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
                            sequelize.col("zipCode"),
                        ),
                        "Address",
                    ],
                    ["patientNote", "Notes"],
                ],
                where: {
                    caseTag: "pending",
                    deletedAt: null,
                },
            },
            active: {
                attributes: [
                    [
                        sequelize.fn(
                            "CONCAT",
                            sequelize.col("patientFirstName"),
                            " ",
                            sequelize.col("patientLastName"),
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
                            sequelize.col("requestorLastName"),
                        ),
                        "Requestor",
                    ],
                    [
                        sequelize.fn(
                            "CONCAT",
                            sequelize.col("User.firstName"),
                            " ",
                            sequelize.col("User.lastName"),
                        ),
                        "Physician Name",
                    ],
                    ["updatedAt", "Date Of Service"],
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
                            sequelize.col("zipCode"),
                        ),
                        "Address",
                    ],
                    ["patientNote", "Notes"],
                ],
                where: {
                    isAgreementSent: true,
                    physicianId: {
                        [Op.not]: null,
                    },
                    deletedAt: null,
                },
            },
            conclude: {
                attributes: [
                    [
                        sequelize.fn(
                            "CONCAT",
                            sequelize.col("patientFirstName"),
                            " ",
                            sequelize.col("patientLastName"),
                        ),
                    ],
                    ["dob", "Date Of Birth"],
                    [
                        sequelize.fn(
                            "CONCAT",
                            sequelize.col("User.firstName"),
                            " ",
                            sequelize.col("User.lastName"),
                        ),
                        "Physician Name",
                    ],
                    ["updatedAt", "Date Of Service"],
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
                            sequelize.col("zipCode"),
                        ),
                        "Address",
                    ],
                ],
                where: {
                    completedByPhysician: true,
                    deletedAt: null,
                },
            },
            close: {
                attributes: [
                    [
                        sequelize.fn(
                            "CONCAT",
                            sequelize.col("patientFirstName"),
                            " ",
                            sequelize.col("patientLastName"),
                        ),
                        "Name",
                    ],
                    ["dob", "Date Of Birth"],
                    ["regionName", "Region"],
                    [
                        sequelize.fn(
                            "CONCAT",
                            sequelize.col("User.firstName"),
                            " ",
                            sequelize.col("User.lastName"),
                        ),
                        "Physician Name",
                    ],
                    ["updatedAt", "Date Of Service"],
                    [
                        sequelize.fn(
                            "CONCAT",
                            sequelize.col("street"),
                            ", ",
                            sequelize.col("city"),
                            ", ",
                            sequelize.col("state"),
                            ", ",
                            sequelize.col("zipCode"),
                        ),
                        "Address",
                    ],
                    ["patientNote", "Notes"],
                ],
                where: {
                    caseTagPhysician: "Completed",
                    deletedAt: null,
                },
            },
            unpaid: {
                attributes: [
                    [
                        sequelize.fn(
                            "CONCAT",
                            sequelize.col("patientFirstName"),
                            " ",
                            sequelize.col("patientLastName"),
                        ),
                        "Name",
                    ],
                    [
                        sequelize.fn(
                            "CONCAT",
                            sequelize.col("User.firstName"),
                            " ",
                            sequelize.col("User.lastName"),
                        ),
                        "Physician Name",
                    ],
                    ["updatedAt", "Date Of Service"],
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
                            sequelize.col("zipCode"),
                        ),
                        "Address",
                    ],
                ],
                where: {
                    caseTag: "Close",
                    deletedAt: null,
                },
            },
        };
        const options = stateOptions[state] || stateOptions["new"];

        const newPatient = await Request.findAll({
            ...options,
            include: [
                {
                    model: User,
                    attributes: [],
                },
            ],
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
