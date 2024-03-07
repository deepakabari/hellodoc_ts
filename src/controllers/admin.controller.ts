import { AccountType, CaseTag, RequestStatus } from "../utils/enum.constant";
import httpCode from "../constants/http.constant";
import messageConstant from "../constants/message.constant";
import {
    Region,
    Request,
    RequestWiseFiles,
    Role,
    User,
} from "../db/models/index";
import { Controller } from "../interfaces";
import transporter from "../utils/email";
import dotenv from "dotenv";
import sequelize, { FindAttributeOptions, Includeable } from "sequelize";
import twilio from "twilio";
import { cancelCaseSchema, assignSchema, editCloseSchema, roleSchema } from "../validations";
dotenv.config();

interface RoleGroup {
    [key: string]: string[];
}

/**
 * @function getPatientByState
 * @param req - Express request object, expects `state` in the query parameters.
 * @param res - Express response object used to send the response.
 * @returns - Returns a Promise that resolves to an Express response object. The response contains the status code, a success message, and the patient data.
 * @throws - Throws an error if there's an issue in the execution of the function.
 * @description This function is an Express controller that retrieves patients based on their state ('new', 'pending', 'active', 'conclude', 'to close', 'unPaid') and sends the patient data in the response. The patient data includes the patient's name, date of birth, requestor, date of service, phone number, address, and notes, etc...
 */
export const getPatientByState: Controller = async (req, res) => {
    try {
        const { state } = req.query;
        let attributes;
        let condition;
        let includeModels;
        switch (state) {
            case "new":
                attributes = [
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
                    ["createdAt", "Date Of Service"],
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
                    ["patientNote", "Notes"],
                ];

                condition = { caseTag: "New", deletedAt: null };
                break;
            case "pending":
                attributes = [
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
                    ["transferNote", "Notes"],
                ];
                condition = { caseTag: "Pending", deletedAt: null };
                includeModels = [
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
                break;
            case "active":
                attributes = [
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
                    ["transferNote", "Notes"],
                ];
                condition = { caseTag: "Active", deletedAt: null };
                includeModels = [
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
                break;
            case "conclude":
                attributes = [
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
                    ["updatedAt", "Date Of Service"],
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
                condition = { caseTag: "Conclude", deletedAt: null };
                includeModels = [
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
                break;
            case "toClose":
                attributes = [
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
                    ["state", "Region"],
                    ["updatedAt", "Date Of Service"],
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
                    ["transferNote", "Notes"],
                ];
                condition = { caseTag: "To Close", deletedAt: null };
                includeModels = [
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
                break;
            case "unPaid":
                attributes = [
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
                    ["updatedAt", "Date Of Service"],
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
                condition = { caseTag: "UnPaid", deletedAt: null };
                includeModels = [
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
                break;
            default:
                return res.status(httpCode.INTERNAL_SERVER_ERROR).json({
                    status: httpCode.INTERNAL_SERVER_ERROR,
                    message: messageConstant.INTERNAL_SERVER_ERROR,
                });
        }

        const patients = await Request.findAll({
            attributes: attributes as FindAttributeOptions,
            where: condition,
            include: includeModels as unknown as Includeable[],
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

/**
 * @function viewCase
 * @param req - Express request object, expects `id` in the parameters.
 * @param res - Express response object used to send the response.
 * @returns - Returns a Promise that resolves to an Express response object. The response contains the status code, a success message, and the case data.
 * @description This function is an Express controller that retrieves a case by its ID and sends the case data in the response. The case data includes the patient's name, date of birth, phone number, email, region, address, and room number.
 */
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

/**
 * @function viewNotes
 * @param req - Express request object, expects `id` in the parameters and `adminNotes` in the body.
 * @param res - Express response object used to send the response.
 * @returns - Returns a Promise that resolves to an Express response object. The response contains the status code, a success message, and the notes data along with the updated admin notes.
 * @description This function is an Express controller that retrieves the transfer and physician notes of a case by its ID, updates the admin notes of the case, and sends the notes data and the updated admin notes in the response.
 */
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

/**
 * @function cancelCase
 * @param req - Express request object, expects `id` in the parameters and `adminNotes` and `reasonForCancellation` in the body.
 * @param res - Express response object used to send the response.
 * @returns - Returns a Promise that resolves to an Express response object. The response contains the status code, a success message, and the updated case data.
 * @description This function is an Express controller that updates a case with the provided admin notes and cancellation reason, changes the status of the case to 'CancelledByAdmin', and sends the updated case data in the response.
 */
export const cancelCase: Controller = async (req, res) => {
    try {
        const { error } = cancelCaseSchema.validate(req.body);
        if (error) {
            return res.status(httpCode.UNPROCESSABLE_CONTENT).json({
                status: httpCode.UNPROCESSABLE_CONTENT,
                message: error,
            });
        }
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

/**
 * @function blockCase
 * @param req - Express request object, expects `id` in the parameters and `description` in the body.
 * @param res - Express response object used to send the response.
 * @returns - Returns a Promise that resolves to an Express response object. The response contains the status code, a success message, and the updated case data.
 * @description This function is an Express controller that updates a case with the provided description, changes the status of the case to 'Blocked', and sends the updated case data in the response.
 */
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

/**
 * @function clearCase
 * @param req - Express request object, expects `id` in the parameters.
 * @param res - Express response object used to send the response.
 * @returns - Returns a Promise that resolves to an Express response object. The response contains the status code, a success message, and the updated case data.
 * @description This function is an Express controller that updates the status of a case to 'Cleared' and sends the updated case data in the response.
 */
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

/**
 * @function sendAgreement
 * @param req - Express request object, expects `id` in the parameters.
 * @param res - Express response object used to send the response.
 * @returns - Returns a Promise that resolves to an Express response object. The response contains the status code and a success message.
 * @description This function is an Express controller that retrieves a user by their ID, sends an agreement to the user's email and phone number, and sends a success response.
 */
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

/**
 * @function getRegions
 * @param req - Express request object.
 * @param res - Express response object used to send the response.
 * @returns - Returns a Promise that resolves to an Express response object. The response contains the status code, a success message, and the regions data.
 * @description This function is an Express controller that retrieves all regions and sends the regions data in the response.
 */
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

/**
 * @function getPhysicianByRegion
 * @param req - Express request object, expects `id` in the parameters.
 * @param res - Express response object used to send the response.
 * @returns - Returns a Promise that resolves to an Express response object. The response contains the status code, a success message, and the physicians data.
 * @description This function is an Express controller that retrieves all physicians in a specific region and sends the physicians data in the response.
 */
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

/**
 * @function assignCase
 * @param req - Express request object, expects `transferNote` in the body.
 * @param res - Express response object used to send the response.
 * @returns - Returns a Promise that resolves to an Express response object. The response contains the status code and a success message.
 * @description This function is an Express controller that assigns a case based on the provided physicianId, admin note and update physicianId and adminNotes and caseTag: Pending and sends a success response.
 */
export const assignCase: Controller = async (req, res) => {
    try {
        const { error } = assignSchema.validate(req.body);
        if (error) {
            return res.status(httpCode.UNPROCESSABLE_CONTENT).json({
                status: httpCode.UNPROCESSABLE_CONTENT,
                message: error,
            });
        }
        const { physicianId, transferNote } = req.body;
        const { id } = req.params;

        await Request.update(
            { physicianId, transferNote, caseTag: CaseTag.Pending },
            { where: { id } }
        );

        return res.status(httpCode.OK).json({
            status: httpCode.OK,
            message: messageConstant.SUCCESS,
        });
    } catch (error) {
        throw error;
    }
};

/**
 * @function viewUploads
 * @param req - Express request object, expects `id` in the parameters.
 * @param res - Express response object used to send the response.
 * @returns - Returns a Promise that resolves to an Express response object. The response contains the status code, a success message, and the uploads data with formatted dates.
 * @description This function is an Express controller that retrieves all uploads for a specific request, formats the upload dates, and sends the uploads data in the response.
 */
export const viewUploads: Controller = async (req, res) => {
    try {
        const { id } = req.params;
        const uploads = await RequestWiseFiles.findAll({
            where: { requestId: id },
            attributes: ["fileName", "createdAt"],
        });

        const formattedUploads = uploads.map((upload) => {
            const date = new Date(upload.createdAt);
            const formattedDate = date.toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
            });
            const { createdAt, ...uploadWithoutCreatedAt } = upload.toJSON();
            return {
                ...uploadWithoutCreatedAt,
                "Upload Date": formattedDate,
            };
        });

        return res.status(httpCode.OK).json({
            status: httpCode.OK,
            message: messageConstant.SUCCESS,
            data: formattedUploads,
        });
    } catch (error) {
        throw error;
    }
};

/**
 * @function closeCase
 * @param req - Express request object, expects `id` in the parameters.
 * @param res - Express response object used to send the response.
 * @returns - Returns a Promise that resolves to an Express response object. The response contains the status code, a success message, and the case data.
 * @description This function is an Express controller that retrieves a case by its ID and sends the case data in the response.
 */
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

/**
 * @param req - Express request object, expects `patientPhoneNumber` and `patientEmail` in the body.
 * @param res - Express response object used to send the response.
 * @returns - Returns a Promise that resolves to an Express response object. The response contains the status code, a success message, and the updated case data.
 * @description This function is an Express controller that updates the phone number and email of a patient in a case and sends the updated case data in the response.
 */
export const editCloseCase: Controller = async (req, res) => {
    try {
        const { error } = editCloseSchema.validate(req.body);
        if (error) {
            return res.status(httpCode.UNPROCESSABLE_CONTENT).json({
                status: httpCode.UNPROCESSABLE_CONTENT,
                message: error,
            });
        }
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

/**
 * @function adminProfile
 * @param req - Express request object.
 * @param res - Express response object used to send the response.
 * @returns - Returns a Promise that resolves to an Express response object. The response contains the status code, a success message, and the admin profile data.
 * @description This function is an Express controller that retrieves the profile data of all admins and sends the data in the response.
 */
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

/**
 * @function requestSupport
 * @param req - Express request object.
 * @param res - Express response object used to send the response.
 * @returns - Returns a Promise that resolves to an Express response object. The response contains the status code and a success message.
 * @description This function is an Express controller that retrieves all unscheduled physicians, sends a message to each of them, and sends a success response.
 */
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

/**
 * @function accountAccess
 * @param req - Express request object.
 * @param res - Express response object used to send the response.
 * @returns - Returns a Promise that resolves to an Express response object. The response contains the status code, a success message, and the grouped roles data.
 * @description This function is an Express controller that retrieves all roles, groups them by account type, and sends the grouped roles data in the response.
 */
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

/**
 * @param req - Express request object, expects `roleName` and `accountType` in the body.
 * @param res - Express response object used to send the response.
 * @returns - Returns a Promise that resolves to an Express response object. The response contains the status code, a success message, and the created role data. If a role with the provided name already exists, it returns a conflict error message.
 * @description This function is an Express controller that handles the creation of a new role for a specific account type. It first checks if a role with the provided name already exists. If it does, it sends a conflict error response. If not, it creates a new role with the provided name and account type, and sends a success response with the created role data.
 */
export const createRole: Controller = async (req, res) => {
    try {
        const { error } = roleSchema.validate(req.body);
        if (error) {
            return res.status(httpCode.UNPROCESSABLE_CONTENT).json({
                status: httpCode.UNPROCESSABLE_CONTENT,
                message: error,
            });
        }
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

/**
 * @function transferRequest
 * @param req - Express request object, expects `physicianId` and `transferNote` in the body, and `id` in the parameters.
 * @param res - Express response object used to send the response.
 * @returns - Returns a Promise that resolves to an Express response object. The response contains the status code and a success message if the request is successfully updated. If the request is not updated, it returns an error message.
 * @description This function is an Express controller that handles request transfer. It updates the `physicianId` and `transferNote` of a request with the given `id` and sends a success response.
 */
export const transferRequest: Controller = async (req, res) => {
    try {
        const { error } = assignSchema.validate(req.body);
        if (error) {
            return res.status(httpCode.UNPROCESSABLE_CONTENT).json({
                status: httpCode.UNPROCESSABLE_CONTENT,
                message: error,
            });
        }
        const { physicianId, transferNote } = req.body;
        const { id } = req.params;

        await Request.update({ physicianId, transferNote }, { where: { id } });

        return res.status(httpCode.OK).json({
            status: httpCode.OK,
            message: messageConstant.SUCCESS,
        });
    } catch (error) {
        throw error;
    }
};
