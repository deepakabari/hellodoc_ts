import httpCode from "../../../constants/http.constant";
import messageConstant from "../../../constants/message.constant";
import { Region, User } from "../../../db/models/index";
import { Controller, AdminUpdates, BillingUpdates } from "../../../interfaces";
import dotenv from "dotenv";
dotenv.config();

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
                "userName",
                "status",
                "firstName",
                "lastName",
                "email",
                "phoneNumber",
                "address1",
                "address2",
                "city",
                "state",
                "zipCode",
                "altPhone",
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
