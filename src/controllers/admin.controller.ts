import fs from "fs";
import path from "path";
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
import sequelize, { FindAttributeOptions, Includeable, Order } from "sequelize";
import twilio from "twilio";
import * as exphbs from "express-handlebars";
import dotenv from "dotenv";
import { Op } from "sequelize";
dotenv.config();

interface RoleGroup {
    [key: string]: string[];
}

type AdminUpdates = {
    firstName?: string;
    lastName?: string;
    email?: string;
    confirmEmail?: string;
    phoneNumber?: string;
};

type BillingUpdates = {
    address1?: string;
    address2?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    altPhone?: string;
};

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
        // Extract variables from query parameters
        const { state, search, sortBy, orderBy } = req.query;

        // Take needed attributes and modify accordingly
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
            ["updatedAt", "Date Of Service"],
            ["requestType", "Requestor Type"],
            ["state", "Region"],
            ["caseTag", "State of Request"],
        ];
        let condition;
        let includeModels;
        let sortByModel;

        switch (sortBy) {
            case "id":
            case "Requested Date":
            case "Date Of Service":
                sortByModel = [[sortBy, orderBy]];
                break;
        }

        switch (state) {
            case "new":
                condition = { caseTag: "New", deletedAt: null };
                break;
            case "pending":
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
            case "to close":
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
            case "unpaid":
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

        // Select query to select attributes with respect to where condition and searching & ordering
        const patients = await Request.findAll({
            attributes: attributes as FindAttributeOptions,
            where: {
                ...condition,
                ...(search
                    ? {
                          [Op.or]: [
                              {
                                  patientFirstName: {
                                      [Op.like]: `%${search}%`,
                                  },
                              },
                              { patientLastName: { [Op.like]: `%${search}%` } },
                          ],
                      }
                    : {}),
            },
            include: includeModels as unknown as Includeable[],
            order: sortByModel as Order,
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
        // Extract id from request parameter
        const { id } = req.params;

        // select query to find attributes from Request table
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
                ["caseTag", "Case Tag"],
            ],
            where: { id },
        });

        // success response with data in response body
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
 * @description This function is an Express controller that retrieves the transfer and physician notes of a case by its ID, and sends the notes data.
 */
export const viewNotes: Controller = async (req, res) => {
    try {
        // Extract id from request parameter
        const { id } = req.params;

        // Select query to retrieve asked attributes from Request table
        const notes = await Request.findAll({
            attributes: [
                "id",
                ["transferNote", "Transfer Notes"],
                ["physicianNotes", "Physician Notes"],
                ["adminNotes", "Admin Notes"],
                ["patientNote", "Patient Note"],
            ],
            where: { id },
        });

        return res.json({
            status: httpCode.OK,
            message: messageConstant.SUCCESS,
            data: notes,
        });
    } catch (error) {
        console.error(error);
        throw error;
    }
};

/**
 * @function updateNotes
 * @param req - Express request object, expects `id` in the parameters and `adminNotes` in the body.
 * @param res - Express response object used to send back the HTTP response.
 * @returns - Returns a Promise that resolves to an Express response object. The response contains the HTTP status code and a success message.
 * @description This controller function updates the `adminNotes` field for a specific request identified by `id`. It uses the `Request.update` method to apply the changes to the database. Upon successful update, it sends back a response with a status code and a success message.
 */
export const updateNotes: Controller = async (req, res) => {
    try {
        // Extract id from request parameter
        const { id } = req.params;

        // Take adminNotes from request body
        const { adminNotes } = req.body;

        // To update note in the adminNotes in request table 
        await Request.update(
            {
                adminNotes,
            },
            { where: { id } }
        );

        return res.json({
            status: httpCode.OK,
            message: messageConstant.SUCCESS,
        });
    } catch (error) {
        throw error;
    }
};

/**
 * @function getPatientName
 * @param req - Express request object, expects `id` in the parameters.
 * @param res - Express response object used to send the response.
 * @returns - Returns a Promise that resolves to an Express response object. The response contains the status code, a success message, and the patient data.
 * @description This function is an Express controller that retrieve a case with patient name in response.
 */
export const getPatientName: Controller = async (req, res) => {
    try {
        // Extract id from request parameter
        const { id } = req.params;

        // Select query to retrieve asked attributes from request table
        const patientName = await Request.findAll({
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
            ],
            where: { id },
        });

        // success response
        return res.status(httpCode.OK).json({
            status: httpCode.OK,
            message: messageConstant.SUCCESS,
            data: patientName,
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
        // Extract id from request parameter
        const { id } = req.params;

        // take value of these variables from request body
        const { adminNotes, reasonForCancellation } = req.body;

        // To update the requestStatus, adminNotes and caseTag to request table
        await Request.update(
            {
                adminNotes,
                reasonForCancellation,
                requestStatus: RequestStatus.CancelledByAdmin,
                caseTag: CaseTag.Close,
                deletedAt: new Date(),
            },
            {
                where: {
                    id,
                },
            }
        );

        // success response
        return res.status(httpCode.OK).json({
            status: httpCode.OK,
            message: messageConstant.SUCCESS,
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
 * @description This function is an Express controller that updates a case with the provided description, changes the status of the case to 'Blocked'.
 */
export const blockCase: Controller = async (req, res) => {
    try {
        // Extract id from request parameter
        const { id } = req.params;

        // Take value of this from request body
        const { description } = req.body;

        // To update the reason and status to request table
        await Request.update(
            {
                reasonForCancellation: description,
                requestStatus: RequestStatus.Blocked,
                deletedAt: new Date(),
            },
            { where: { id } }
        );

        // success response
        return res.status(httpCode.OK).json({
            status: httpCode.OK,
            message: messageConstant.SUCCESS,
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
 * @description This function is an Express controller that updates the status of a case to 'Cleared'.
 */
export const clearCase: Controller = async (req, res) => {
    try {
        // To update the requestStatus and soft deletion to request table
        await Request.update(
            {
                requestStatus: RequestStatus.Cleared,
                isDeleted: true,
                deletedAt: new Date(),
            },
            {
                where: { id: req.params.id },
            }
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
 * @function sendAgreement
 * @param req - Express request object, expects `id` in the parameters.
 * @param res - Express response object used to send the response.
 * @returns - Returns a Promise that resolves to an Express response object. The response contains the status code and a success message.
 * @description This function is an Express controller that retrieves a user by their ID, sends an agreement to the user's email and phone number, and sends a success response.
 */
export const sendAgreement: Controller = async (req, res) => {
    try {
        // Find user from request table with use of id given in request params
        const user = await Request.findOne({ where: { id: req.params.id } });

        if (!user) {
            return res.status(httpCode.NOT_FOUND).json({
                status: httpCode.NOT_FOUND,
                message: messageConstant.USER_NOT_EXIST,
            });
        }

        const phoneNumber = user.patientPhoneNumber;
        const email = user.patientEmail;

        const agreementLink = "http://localhost:3000/agreement";

        // To create the environment for hbs and compile it to html and then take that data into email
        const data = await new Promise((resolve) => {
            fs.readFile(
                path.join(
                    __dirname,
                    "..",
                    "public",
                    "templates",
                    "sendAgreementEmail.hbs"
                ),
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
                        recipientName: user.patientFirstName,
                        agreementLink,
                    });
                    resolve(htmlToSend);
                }
            );
        });

        let mailOptions = {
            from: process.env.EMAIL,
            to: email,
            subject: "Agreement",
            html: data,
        };

        return transporter.sendMail(mailOptions, (error: Error) => {
            if (error) throw new Error(error.message);
            console.log("Agreement email Sent Successfully");

            // const client = twilio(
            //     process.env.TWILIO_ACCOUNT_SID,
            //     process.env.TWILIO_AUTH_TOKEN
            // );

            // client.messages
            //     .create({
            //         body: "Here you are selected for Maidaan. accept it otherwise we will see you.",
            //         to: phoneNumber,
            //         from: process.env.TWILIO_PHONE_NUMBER,
            //     })
            //     .then((message) => console.log(message.sid));

            return res.json({
                status: httpCode.OK,
                message: messageConstant.AGREEMENT_EMAIL_SENT,
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
 * @description This function is an Express controller that assigns a case based on the provided physicianId, admin note and update physicianId and adminNotes and caseTag: Pending.
 */
export const assignCase: Controller = async (req, res) => {
    try {
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
        const { sortBy, orderBy } = req.query;

        let sortByModel;
        switch (sortBy) {
            case "id":
            case "Upload Date":
                sortByModel = [[sortBy, orderBy]];
                break;
        }

        const uploads = await RequestWiseFiles.findAll({
            where: { requestId: id },
            attributes: ["id", "fileName", ["createdAt", "Upload Date"]],
            order: sortByModel as Order,
        });

        // To format the date in MM(string) DD YYYY format
        // const formattedUploads = uploads.map((upload) => {
        //     const date = new Date(upload.createdAt);
        //     const formattedDate = date.toLocaleDateString("en-US", {
        //         year: "numeric",
        //         month: "short",
        //         day: "numeric",
        //     });
        //     const { createdAt, ...uploadWithoutCreatedAt } = upload.toJSON();
        //     return {
        //         ...uploadWithoutCreatedAt,
        //         "Upload Date": formattedDate,
        //     };
        // });

        return res.status(httpCode.OK).json({
            status: httpCode.OK,
            message: messageConstant.SUCCESS,
            data: uploads,
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
export const closeCaseView: Controller = async (req, res) => {
    try {
        const { id } = req.params;
        const { sortBy, orderBy } = req.query;

        let sortByModel;
        switch (sortBy) {
            case "id":
            case "createdAt":
                sortByModel = [
                    [
                        { model: RequestWiseFiles, as: "requestWiseFiles" },
                        sortBy,
                        orderBy,
                    ],
                ];
                break;
        }

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
            ],
            include: [
                {
                    model: RequestWiseFiles,
                    attributes: [
                        "fileName",
                        "documentPath",
                        ["createdAt", "Upload Date"],
                    ],
                },
            ],
            where: { id },
            order: sortByModel as Order,
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
 * @function closeCase
 * @param req - Express request object. Expects a parameter `id` representing the case ID.
 * @param res - Express response object used to send back the HTTP response.
 * @returns - Returns a Promise that resolves to an Express response object. The response contains the HTTP status code and a success message.
 * @description This controller function updates the status of a case to 'Closed' and its case tag to 'UnPaid'. It is triggered when a case with the tag 'Close' needs to be updated to reflect its closure. The function responds with a success message upon successful update.
 */
export const closeCase: Controller = async (req, res) => {
    try {
        const { id } = req.params;

        await Request.update(
            { requestStatus: RequestStatus.Closed, caseTag: CaseTag.UnPaid },
            { where: { id, caseTag: CaseTag.Close } }
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
 * @param req - Express request object, expects `patientPhoneNumber` and `patientEmail` in the body.
 * @param res - Express response object used to send the response.
 * @returns - Returns a Promise that resolves to an Express response object. The response contains the status code, a success message, and the updated case data.
 * @description This function is an Express controller that updates the phone number and email of a patient in a case.
 */
export const editCloseCase: Controller = async (req, res) => {
    try {
        const { patientPhoneNumber, patientEmail } = req.body;

        await Request.update(
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
        const { id } = req.params;
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
                id,
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

/**
 * @param req - Express request object.
 * @param res - Express response object used to send the response.
 * @returns - Returns a Promise that resolves to an Express response object. The response contains the status code and a success message.
 * @description - This function is an Express controller that updates the  administration or Billing information of admin profile.
 */
export const editAdminProfile: Controller = async (req, res) => {
    try {
        const { id } = req.params;
        const { section, updatedData } = req.body;

        if (!section || !updatedData) {
            return res.status(httpCode.NOT_FOUND).json({
                status: httpCode.NOT_FOUND,
                message: messageConstant.MISSING_SECTION_OR_UPDATED_DATA,
            });
        }

        const updateAdminDetails = async (
            id: string,
            updates: AdminUpdates | BillingUpdates
        ) => {
            try {
                await User.update(updates, {
                    where: { id },
                });
                return true;
            } catch (error) {
                return false;
            }
        };

        let updateResult = false;
        switch (section) {
            case "administration":
                const adminFields = [
                    "firstName",
                    "lastName",
                    "email",
                    "confirmEmail",
                    "phoneNumber",
                ];
                let adminUpdates: any = {};
                adminFields.forEach((field) => {
                    if (updatedData[field] != undefined) {
                        adminUpdates[field] = updatedData[field];
                    }
                });
                updateResult = await updateAdminDetails(id, adminUpdates);
                break;

            case "billing":
                const billingFields = [
                    "address1",
                    "address2",
                    "city",
                    "state",
                    "zipCode",
                    "altPhone",
                ];
                let billingUpdates: any = {};
                billingFields.forEach((field) => {
                    if (updatedData[field] !== undefined) {
                        billingUpdates[field] = updatedData[field];
                    }
                });
                updateResult = await updateAdminDetails(id, billingUpdates);
                break;
        }

        if (!updateResult) {
            return res.status(httpCode.INTERNAL_SERVER_ERROR).json({
                status: httpCode.INTERNAL_SERVER_ERROR,
                message: messageConstant.UPDATE_FAILED,
            });
        }

        return res.status(httpCode.OK).json({
            status: httpCode.OK,
            message: messageConstant.SUCCESS,
        });
    } catch (error) {
        throw error;
    }
};

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
 * Handles the HTTP request to retrieve account access roles.
 * @param req - The Express Request object containing the incoming request data.
 * @param res - The Express Response object used to send back the desired HTTP response.
 * @returns - A promise that resolves to the Express Response object, which sends a JSON response containing the status code, success message, and the retrieved account access data.
 */
export const accountAccess: Controller = async (req, res) => {
    try {
        const accountAccess = await Role.findAll({
            attributes: ["id", "Name", ["accountType", "Account Type"]],
        });

        return res.status(httpCode.OK).json({
            status: httpCode.OK,
            message: messageConstant.SUCCESS,
            data: accountAccess,
        });
    } catch (error) {
        throw error;
    }
};

/**
 * @function accountAccess
 * @param req - Express request object.
 * @param res - Express response object used to send the response.
 * @returns - Returns a Promise that resolves to an Express response object. The response contains the status code, a success message, and the grouped roles data.
 * @description This function is an Express controller that retrieves all roles, groups them by account type, and sends the grouped roles data in the response.
 */
export const accountAccessByAccountType: Controller = async (req, res) => {
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
 * @function userAccess
 * @param req - Express request object.
 * @param res - Express response object used to send back the HTTP response.
 * @returns - Returns a Promise that resolves to an Express response object. The response contains the HTTP status code, a success message, and an array of user data.
 * @description This controller function retrieves a list of users from the database using the `User.findAll` method. It selects specific attributes for each user, including the user's ID, account type, point of contact (POC) name, phone number, status, and region. The function then sends this data back to the client in the response body along with a success message.
 */
export const userAccess: Controller = async (req, res) => {
    try {
        const accountType = req.query.accountType as string;

        let whereCondition: { [key: string]: any } = {};
        if (accountType && accountType !== "All") {
            whereCondition["accountType"] = accountType;
        }

        const users = await User.findAll({
            attributes: [
                "id",
                ["accountType", "Account Type"],
                [
                    sequelize.fn(
                        "CONCAT",
                        sequelize.col("firstName"),
                        " ",
                        sequelize.col("lastName")
                    ),
                    "Account POC",
                ],
                ["phoneNumber", "Phone"],
                ["status", "Status"],
            ],
            where: whereCondition,
        });

        return res.status(httpCode.OK).json({
            status: httpCode.OK,
            message: messageConstant.SUCCESS,
            data: users,
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

/**
 * Sends an email to a patient with a link to create a request on the HalloDoc platform.
 * @param req - The Express Request object containing the incoming request data, including the patient's first name, last name, phone number, and email.
 * @param res - The Express Response object used to send back the desired HTTP response.
 * @returns - A promise that resolves to the Express Response object, which sends a JSON response containing the status code and message indicating the result of the email sending operation.
 */
export const sendPatientRequest: Controller = async (req, res) => {
    try {
        const { firstName, lastName, phoneNumber, email } = req.body;

        const createRequestLink = "http://localhost:3000/createRequest";

        const data = await new Promise((resolve) => {
            fs.readFile(
                path.join(
                    __dirname,
                    "..",
                    "public",
                    "templates",
                    "sendRequestEmail.hbs"
                ),
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
                        patientName: firstName + lastName,
                        createRequestLink,
                    });
                    resolve(htmlToSend);
                }
            );
        });

        const mailOptions = {
            from: process.env.EMAIL_FROM,
            to: email,
            subject: "Create your account at HalloDoc Platform",
            html: data,
        };

        return transporter.sendMail(mailOptions, (error: Error) => {
            if (error) {
                throw error;
            } else {
                // const client = twilio(
                //     process.env.TWILIO_ACCOUNT_SID,
                //     process.env.TWILIO_AUTH_TOKEN
                // );

                // client.messages
                //     .create({
                //         body: "Here you are selected for Maidaan. accept it otherwise we will see you.",
                //         to: "+5571981265131",
                //         from: process.env.TWILIO_PHONE_NUMBER,
                //     })
                //     .then((message) => console.log("message sent: ", message.sid));
                return res.json({
                    status: httpCode.OK,
                    message: messageConstant.REQUEST_EMAIL_SMS_SENT,
                });
            }
        });
    } catch (error) {
        throw error;
    }
};

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
                ["adminNotes", "Admin Notes"],
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
