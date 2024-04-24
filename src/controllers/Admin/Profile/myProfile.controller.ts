import httpCode from '../../../constants/http.constant';
import messageConstant from '../../../constants/message.constant';
import {
    Business,
    Region,
    RequestWiseFiles,
    Role,
    User,
    UserRegion,
} from '../../../db/models/index';
import { Controller, AdminUpdates, BillingUpdates } from '../../../interfaces';
import dotenv from 'dotenv';
dotenv.config();

/**
 * @function adminProfile
 * @param req - Express request object.
 * @param res - Express response object used to send the response.
 * @returns - Returns a Promise that resolves to an Express response object. The response contains the status code, a success message, and the admin profile data.
 * @description This function is an Express controller that retrieves the profile data of all admins and sends the data in the response.
 */
export const myProfile: Controller = async (req, res) => {
    try {
        // Extract the authenticated user's ID from the request object.
        const id = req.user.id;

        // Extract the authenticated user's ID from the request object.
        const myProfile = await User.findAll({
            attributes: [
                'id',
                'userName',
                'status',
                'firstName',
                'lastName',
                'email',
                'phoneType',
                'phoneNumber',
                'dob',
                'street',
                'address1',
                'address2',
                'city',
                'state',
                'zipCode',
                'altPhone',
                'medicalLicense',
                'NPINumber',
            ],
            where: {
                id, // Use the authenticated user's ID as the search criterion.
            },
            include: [
                {
                    model: Region, // Include associated regions in the response.
                    attributes: ['id', 'name'], // Select specific attributes from the Region model.
                    through: { attributes: [] }, // This will exclude the join table attributes
                    required: false,
                },
                {
                    model: Role,
                    attributes: ['id', 'Name'],
                    required: false,
                },
                {
                    model: Business,
                    attributes: ['id', 'businessName', 'businessWebsite'],
                    required: false,
                },
                {
                    model: RequestWiseFiles,
                    attributes: ['id', 'fileName', 'docType', 'documentPath'],
                    required: false,
                },
            ],
        });

        // Send a success response with the admin's profile data.
        return res.status(httpCode.OK).json({
            status: httpCode.OK,
            message: messageConstant.PROFILE_RETRIEVED,
            data: myProfile, // Include the retrieved profile data in the response.
        });
    } catch (error) {
        // If an error occurs, throw it to be handled by the error middleware.
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
        // Extract the authenticated user's ID and the updated data from the request body.
        const id = req.user.id;
        const { section, updatedData } = req.body;

        // Check if the required fields 'section' and 'updatedData' are provided.
        if (!section || !updatedData) {
            // If not, return a 'Not Found' status with an error message.
            return res.status(httpCode.BAD_REQUEST).json({
                status: httpCode.BAD_REQUEST,
                message: messageConstant.MISSING_SECTION_OR_UPDATED_DATA,
            });
        }

        // Define a function to update admin details in the database.
        const updateAdminDetails = async (
            id: number,
            updates: AdminUpdates | BillingUpdates,
        ) => {
            try {
                // Attempt to update the user with the provided updates.
                await User.update(updates, {
                    where: { id },
                });
                return true; // Return true if the update is successful.
            } catch (error) {
                return false; // Return false if there's an error during the update.
            }
        };

        // Initialize a variable to track the result of the update operation.
        let updateResult = false;

        // Use a switch statement to handle different sections of the profile.
        switch (section) {
            case 'administration':
                // Define the fields that can be updated in the administration section.
                const adminFields = [
                    'firstName',
                    'lastName',
                    'email',
                    'confirmEmail',
                    'phoneNumber',
                ];

                // Initialize an object to hold the updates for the administration section.
                let adminUpdates: any = {};

                // Iterate over the admin fields and add them to the updates object if they are provided.
                adminFields.forEach((field) => {
                    if (updatedData[field] != undefined) {
                        adminUpdates[field] = updatedData[field];
                    }
                });

                // If regions are provided, update the user's regions.
                if (updatedData.regions) {
                    // Remove all existing regions associated with the user.
                    await UserRegion.destroy({
                        where: { userId: id },
                        force: true,
                    });

                    // Add new regions for the user
                    for (const regionId of updatedData.regions) {
                        await UserRegion.create({
                            userId: id,
                            regionId: regionId,
                        });
                    }
                }

                // Perform the update operation and store the result.
                updateResult = await updateAdminDetails(id, adminUpdates);
                break;

            case 'billing':
                // Define the fields that can be updated in the billing section.
                const billingFields = [
                    'address1',
                    'address2',
                    'city',
                    'state',
                    'zipCode',
                    'altPhone',
                ];

                // Initialize an object to hold the updates for the billing section.
                let billingUpdates: any = {};

                // Iterate over the billing fields and add them to the updates object if they are provided.
                billingFields.forEach((field) => {
                    if (updatedData[field] !== undefined) {
                        billingUpdates[field] = updatedData[field];
                    }
                });

                // Perform the update operation and store the result.
                updateResult = await updateAdminDetails(id, billingUpdates);
                break;
        }

        // Check the result of the update operation.
        if (!updateResult) {
            // If the update failed, return an 'Internal Server Error' status with an error message.
            return res.status(httpCode.INTERNAL_SERVER_ERROR).json({
                status: httpCode.INTERNAL_SERVER_ERROR,
                message: messageConstant.UPDATE_FAILED,
            });
        }

        // If the update was successful, return an 'OK' status with a success message.
        return res.status(httpCode.OK).json({
            status: httpCode.OK,
            message: messageConstant.PROFILE_UPDATED,
        });
    } catch (error) {
        throw error;
    }
};
