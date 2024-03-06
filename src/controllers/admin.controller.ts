import { AccountType, RequestStatus } from "../utils/enum.constant";
import httpCode from "../constants/http.constant";
import messageConstant from "../constants/message.constant";
import { Region, Request, Role, User } from "../db/models/index";
import { Controller } from "../interfaces";
import transporter from "../utils/email";
import dotenv from "dotenv";
import sequelize, { FindAttributeOptions, Includeable } from "sequelize";
import twilio from "twilio";
dotenv.config();

type AdditionalConditionsType = {
    caseTag?: string;
    deletedAt?: null;
    completedByPhysician?: boolean;
};

export const getPatientByState: Controller = async (req, res) => {
    try {
        const { state } = req.query;

        let attributes = [
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
            ["dob", "Date Of Birth"],
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
        ];

        let additionalConditions: AdditionalConditionsType = {};
        let includeModels = [
            {
                model: User,
                as: "physician",
                attributes: [
                    [
                        sequelize.fn(
                            "CONCAT",
                            sequelize.col("firstName"),
                            " ",
                            sequelize.col("lastName")
                        ),
                        "Physician Name",
                    ],
                ],
                where: {
                    id: sequelize.col("Request.physicianId"),
                },
            },
        ];

        switch (state) {
            case "new":
                additionalConditions = { caseTag: "New", deletedAt: null };
                break;
            case "pending":
                attributes.push(
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
                    ["updatedAt", "Date Of Service"],
                    ["patientNote", "Notes"]
                );
                additionalConditions = { caseTag: "Pending", deletedAt: null };
                break;

            case "conclude":
            case "toClose":
            case "unPaid":
                attributes.push(
                    ["updatedAt", "Date Of Service"],
                    ["patientNote", "Notes"]
                );
                additionalConditions = { caseTag: state, deletedAt: null };
                // Specific condition for 'Conclude'
                if (state === "conclude") {
                    additionalConditions.completedByPhysician = true;
                }
                break;

            default:
                return res.status(httpCode.BAD_REQUEST).json({
                    status: httpCode.BAD_REQUEST,
                    message: messageConstant.BAD_REQUEST,
                });
        }

        const patients = await Request.findAll({
            attributes: attributes as FindAttributeOptions,
            where: additionalConditions,
            include: includeModels as Includeable,
        });

        return res.json({
            status: httpCode.OK,
            message: messageConstant.SUCCESS,
            data: patients,
        });
    } catch (error) {
        throw error;
    }
};

export const viewCase: Controller = async (req, res) => {
    try {
        const viewCase = await Request.findAll({
            attributes: [
                "id",
                ["confirmationNumber", "Confirmation Number"],
                ["patientNote", "Patient Notes"],
                ["patientFirstName", "First Name"],
                ["patientLastName", "Last Name"],
                ["dob", "Date Of Birth"],
                ["patientPhoneNumber", "Phone Number"],
                ["patientEmail", "Email"],
                ["state", "Region"],
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
                ["roomNumber", "Room"],
            ],
            where: {
                id: req.params.id,
            },
        });

        return res.json({
            status: httpCode.OK,
            message: messageConstant.SUCCESS,
            data: viewCase,
        });
    } catch (error) {
        throw error;
    }
};

export const viewNotes: Controller = async (req, res) => {
    try {
        const notes = await Request.findAll({
            attributes: [
                ["transferNote", "Transfer Notes"],
                ["physicianNotes", "Physician Notes"],
            ],
            where: {
                id: req.params.id,
            },
        });
        const { adminNotes } = req.body;
        const updateAdminNotes = Request.update(
            {
                adminNotes,
            },
            { where: { id: req.params.id } }
        );

        return res.json({
            status: httpCode.OK,
            message: messageConstant.SUCCESS,
            data: {
                notes,
                updateAdminNotes,
            },
        });
    } catch (error) {
        throw error;
    }
};

export const cancelCase: Controller = async (req, res) => {
    try {
        const { adminNotes, reasonForCancellation } = req.body;
        const cancelCase = await Request.update(
            {
                adminNotes,
                reasonForCancellation,
                requestStatus: RequestStatus.CancelledByAdmin,
            },
            {
                where: {
                    id: req.params.id,
                },
            }
        );

        return res.status(httpCode.OK).json({
            status: httpCode.OK,
            message: messageConstant.SUCCESS,
            data: cancelCase,
        });
    } catch (error) {
        throw error;
    }
};

export const blockCase: Controller = async (req, res) => {
    try {
        const { description } = req.body;
        const blockCase = await Request.update(
            {
                reasonForCancellation: description,
                requestStatus: RequestStatus.Blocked,
            },
            { where: { id: req.params.id } }
        );

        return res.status(httpCode.OK).json({
            status: httpCode.OK,
            message: messageConstant.SUCCESS,
            data: blockCase,
        });
    } catch (error) {
        throw error;
    }
};

export const clearCase: Controller = async (req, res) => {
    try {
        const clearCase = await Request.update(
            {
                requestStatus: RequestStatus.Cleared,
            },
            {
                where: { id: req.params.id },
            }
        );
        return res.status(httpCode.OK).json({
            status: httpCode.OK,
            message: messageConstant.SUCCESS,
            data: clearCase,
        });
    } catch (error) {
        throw error;
    }
};

export const sendAgreement: Controller = async (req, res) => {
    try {
        const user = await Request.findOne({ where: { id: req.params.id } });

        if (!user) {
            return res.status(httpCode.NOT_FOUND).json({
                status: httpCode.NOT_FOUND,
                message: messageConstant.USER_NOT_EXIST,
                data: null,
            });
        }

        const phoneNumber = user.patientPhoneNumber;
        const email = user.patientEmail;

        let mailOptions = {
            from: process.env.EMAIL,
            to: email,
            subject: "Agreement",
            text: "Here is the agreement.",
        };

        return transporter.sendMail(mailOptions, (error: Error) => {
            if (error) throw new Error(error.message);
            console.log("Email Sent Successfully");

            const client = twilio(
                process.env.TWILIO_ACCOUNT_SID,
                process.env.TWILIO_AUTH_TOKEN
            );

            client.messages
                .create({
                    body: "Here you are selected for Maidaan. accept it otherwise we will see you.",
                    to: phoneNumber,
                    from: process.env.TWILIO_PHONE_NUMBER,
                })
                .then((message) => console.log(message.sid));

            return res.json({
                status: httpCode.OK,
                message: messageConstant.RESET_EMAIL_SENT,
            });
        });
    } catch (error) {
        throw error;
    }
};

export const getRegions: Controller = async (req, res) => {
    try {
        const getRegions = await Region.findAll({
            attributes: ["id", "name"],
        });

        return res.status(httpCode.OK).json({
            status: httpCode.OK,
            message: messageConstant.SUCCESS,
            data: getRegions,
        });
    } catch (error) {
        throw error;
    }
};

export const getPhysicianByRegion: Controller = async (req, res) => {
    try {
        const { id } = req.params;
        const getPhysicianByRegion = await User.findAll({
            where: {
                accountType: AccountType.Physician,
            },
            include: [
                {
                    model: Region,
                    as: "regions",
                    where: { id: id },
                    through: {
                        attributes: [],
                    },
                    attributes: [],
                },
            ],
            attributes: ["id", "firstName", "lastName"],
        });

        return res.status(httpCode.OK).json({
            status: httpCode.OK,
            message: messageConstant.SUCCESS,
            data: getPhysicianByRegion,
        });
    } catch (error) {
        throw error;
    }
};

export const assignCase: Controller = async (req, res) => {
    try {
        const { transferNote } = req.body;
        return res.status(httpCode.OK).json({
            status: httpCode.OK,
            message: messageConstant.SUCCESS,
        });
    } catch (error) {
        throw error;
    }
};

export const viewUploads: Controller = async (req, res) => {
    try {
        const { id } = req.params;
        const uploads = await Request.findAll({
            where: { id },
            attributes: ["documentPhoto"],
        });

        // Parse the filenames to get the upload dates and original file names
        const documents = uploads.map((upload) => {
            const parts = upload.documentPhoto.split("\\");
            const filename = parts[parts.length - 1];
            const splitdata = filename.split("-");
            const dateRaw = splitdata[0];
            const dateString = new Date(dateRaw);
            const year = dateString.getFullYear();
            const month = dateString.getMonth() + 1; // JavaScript months are 0-indexed.
            const day = dateString.getDate();
            const date = `${year}-${month}-${day}`;
            const originalName = splitdata[1];
            return { originalName, date };
        });

        return res.status(httpCode.OK).json({
            status: httpCode.OK,
            message: messageConstant.SUCCESS,
            data: documents,
        });
    } catch (error) {
        throw error;
    }
};

export const closeCase: Controller = async (req, res) => {
    try {
        const closeCase = await Request.findAll({
            attributes: [
                "id",
                [
                    sequelize.fn(
                        "CONCAT",
                        sequelize.col("patientFirstName"),
                        " ",
                        sequelize.col("patientLastName")
                    ),
                    "Patient Name",
                ],
                ["confirmationNumber", "Confirmation Number"],
                ["patientFirstName", "First Name"],
                ["patientLastName", "Last Name"],
                ["dob", "Date Of Birth"],
                ["patientPhoneNumber", "Phone Number"],
                ["patientEmail", "Email"],
                ["documentPhoto", "Documents"],
            ],
            where: { id: req.params.id },
        });

        return res.status(httpCode.OK).json({
            status: httpCode.OK,
            message: messageConstant.SUCCESS,
            data: closeCase,
        });
    } catch (error) {
        throw error;
    }
};

export const editCloseCase: Controller = async (req, res) => {
    try {
        const { patientPhoneNumber, patientEmail } = req.body;

        const editCloseCase = await Request.update(
            {
                patientPhoneNumber,
                patientEmail,
            },
            {
                where: {
                    id: req.params.id,
                },
            }
        );

        return res.status(httpCode.OK).json({
            status: httpCode.OK,
            message: messageConstant.SUCCESS,
            data: editCloseCase,
        });
    } catch (error) {
        throw error;
    }
};

export const adminProfile: Controller = async (req, res) => {
    try {
        const adminProfile = await User.findAll({
            attributes: [
                "id",
                ["userName", "User Name"],
                ["status", "Status"],
                ["firstName", "First Name"],
                ["lastName", "Last Name"],
                ["email", "Email"],
                ["phoneNumber", "Phone Number"],
                ["address1", "Address 1"],
                ["address2", "Address 2"],
                ["city", "City"],
                ["state", "State"],
                ["zipCode", "zip"],
                ["altPhone", "Alternate PhoneNumber"],
            ],
            where: {
                accountType: "Admin",
            },
            include: [
                {
                    model: Region,
                    attributes: ["id", "name"],
                    through: { attributes: [] }, // This will exclude the join table attributes
                },
            ],
        });

        return res.status(httpCode.OK).json({
            status: httpCode.OK,
            message: messageConstant.SUCCESS,
            data: adminProfile,
        });
    } catch (error) {
        throw error;
    }
};

// export const downloadDocument: Controller = async (req, res) => {

// };
export const requestSupport: Controller = async (req, res) => {
    try {
        const unScheduledPhysician = await User.findAll({
            where: { accountType: "Physician", onCallStatus: "UnScheduled" },
        });

        for (const physician of unScheduledPhysician) {
            console.log(`Sending message to ${physician.firstName}`);
        }

        return res.status(httpCode.OK).json({
            status: httpCode.OK,
            message: messageConstant.MESSAGE_SENT_SUCCESSFULLY,
        });
    } catch (error) {
        throw new Error(messageConstant.ERROR_SEND_MESSAGE);
    }
};

interface RoleGroup {
    [key: string]: string[];
}

export const accountAccess: Controller = async (req, res) => {
    try {
        const roles = await Role.findAll({
            attributes: ["accountType", "Name"],
            order: ["accountType"],
        });

        const groupedRoles: RoleGroup = roles.reduce(
            (result: RoleGroup, role) => {
                const key = role.accountType;
                if (!result[key]) {
                    result[key] = [];
                }
                result[key].push(role.Name);
                return result;
            },
            {} as RoleGroup
        );

        return res.status(httpCode.OK).json({
            status: httpCode.OK,
            message: messageConstant.SUCCESS,
            data: groupedRoles,
        });
    } catch (error) {
        throw error;
    }
};

export const createRole: Controller = async (req, res) => {
    try {
        const { roleName, accountType } = req.body;

        const existingRole = await Role.findOne({ where: { Name: roleName } });

        if (existingRole) {
            return res.status(httpCode.CONFLICT).json({
                status: httpCode.CONFLICT,
                message: messageConstant.ROLE_ALREADY_EXISTS,
            });
        }

        const createRole = await Role.create({
            Name: roleName,
            accountType,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        return res.status(httpCode.OK).json({
            status: httpCode.OK,
            message: messageConstant.SUCCESS,
            data: createRole,
        });
    } catch (error) {
        throw error;
    }
};
