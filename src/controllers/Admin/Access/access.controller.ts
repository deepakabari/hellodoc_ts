import { Order } from 'sequelize';
import httpCode from '../../../constants/http.constant';
import messageConstant from '../../../constants/message.constant';
import {
    Permission,
    Role,
    RolePermissionMap,
    User,
} from '../../../db/models/index';
import { Controller } from '../../../interfaces';
import dotenv from 'dotenv';
import { Op } from 'sequelize';
import { sequelize } from '../../../db/config/db.connection';

dotenv.config();

/**
 * Handles the HTTP request to retrieve account access roles.
 * @param req - The Express Request object containing the incoming request data.
 * @param res - The Express Response object used to send back the desired HTTP response.
 * @returns - A promise that resolves to the Express Response object, which sends a JSON response containing the status code, success message, and the retrieved account access data.
 */
export const accountAccess: Controller = async (req, res) => {
    try {
        // Extract query parameters
        const { sortBy, orderBy, page, pageSize } = req.query;

        // Parse pagination parameters
        const pageNumber = parseInt(page as string, 10) || 1;
        const limit = parseInt(pageSize as string, 10) || 10;
        const offset = (pageNumber - 1) * limit;

        // Initialize sorting model
        let sortByModel: Order = [];

        // Check if sortBy and orderBy are provided, construct sorting model
        if (sortBy && orderBy) {
            sortByModel = [[sortBy, orderBy]] as Order;
        }

        // Fetch data from database based on pagination and sorting
        const accountAccess = await Role.findAndCountAll({
            attributes: ['id', 'Name', 'accountType'], // Select specific attributes
            order: sortByModel, // Apply sorting if provided
            limit, // Limit the number of results per page
            offset, // Offset for pagination
        });

        // Return data in JSON response
        return res.status(httpCode.OK).json({
            status: httpCode.OK,
            message: messageConstant.ACCOUNT_ACCESS_RETRIEVED,
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
        // Extract query parameters
        const { accountTypes } = req.query;

        // Initialize where condition object
        let whereCondition: { [key: string]: any } = {};

        // Check if accountTypes is provided and not 'all', construct where condition
        if (accountTypes && accountTypes !== 'All') {
            whereCondition['accountType'] = accountTypes;
        }

        // Fetch roles from database based on account type filter
        const roles = await Permission.findAll({
            attributes: ['id', 'accountType', 'name'], // Select specific attributes
            order: ['accountType'], // Order roles by accountType
            where: whereCondition,
        });

        // Return roles in JSON response
        return res.status(httpCode.OK).json({
            status: httpCode.OK,
            message: messageConstant.PERMISSION_RETRIEVED,
            data: roles,
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
    const transaction = await sequelize.transaction();
    try {
        // Extract query parameters
        const { roleName, accountType, permissionIds } = req.body;

        // Check if role with the same name already exists
        const existingRole = await Role.findOne({ where: { Name: roleName } });

        // If role already exists, return conflict response
        if (existingRole) {
            await transaction.rollback();
            return res.status(httpCode.CONFLICT).json({
                status: httpCode.CONFLICT,
                message: messageConstant.ROLE_ALREADY_EXISTS,
            });
        }

        // Create new role
        const createRole = await Role.create(
            {
                Name: roleName,
                accountType,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            { transaction },
        );

        // Associate permissions with the new role
        for (const permissionId of permissionIds) {
            await RolePermissionMap.create(
                {
                    roleId: createRole.id,
                    permissionId,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                { transaction },
            );
        }

        await transaction.commit();

        // Return success response
        return res.status(httpCode.OK).json({
            status: httpCode.OK,
            message: messageConstant.ROLE_CREATED,
            data: createRole,
        });
    } catch (error) {
        await transaction.rollback();
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
        // Extract query parameters
        const { accountType, sortBy, orderBy, page, pageSize } = req.query;

        // Parse pagination parameters
        const pageNumber = parseInt(page as string, 10) || 1;
        const limit = parseInt(pageSize as string, 10) || 10;
        const offset = (pageNumber - 1) * limit;

        // Initialize sorting model
        let sortByModel: Order = [];

        // Check if sortBy and orderBy are provided, construct sorting model
        if (sortBy && orderBy) {
            sortByModel = [[sortBy, orderBy]] as Order;
        }

        // Initialize where condition object
        let whereCondition: { [key: string]: any } = {
            // Exclude 'user' accountType from all results
            accountType: {
                [Op.not]: 'user',
            },
        };

        // Add accountType filter if provided
        if (accountType && accountType !== 'All') {
            whereCondition['accountType'] = accountType;
        }

        // Fetch users from database based on filters and pagination
        const users = await User.findAndCountAll({
            attributes: [
                'id',
                'accountType',
                'firstName',
                'lastName',
                'phoneNumber',
                'status',
            ],
            where: whereCondition,
            order: sortByModel,
            limit,
            offset,
        });

        // Return users in JSON response
        return res.status(httpCode.OK).json({
            status: httpCode.OK,
            message: messageConstant.USER_ACCESS_RETRIEVED,
            data: users,
        });
    } catch (error) {
        throw error;
    }
};

/**
 * @function viewRole
 * @param req - Express request object.
 * @param res - Express response object used to send back the HTTP response.
 * @returns - Returns a Promise that resolves to an Express response object. The response contains the HTTP status code, a success message, and an array of user data.
 */
export const viewRole: Controller = async (req, res) => {
    try {
        // Extract the role ID from the request parameters.
        const { id } = req.params;

        // Find the role by its ID
        const existingRole = await Role.findByPk(id);

        // If role doesn't exist, return bad request response
        if (!existingRole) {
            return res.status(httpCode.BAD_REQUEST).json({
                status: httpCode.BAD_REQUEST,
                message: messageConstant.INVALID_INPUT,
            });
        }

        // Fetch role details including associated permissions
        const viewRole = await Role.findAll({
            attributes: ['id', 'Name', 'accountType'],
            where: { id },
            include: [
                {
                    model: Permission,
                    attributes: ['id', 'name', 'accountType'],
                    through: { attributes: [] }, // Exclude junction table attributes
                },
            ],
        });

        // Return role details in JSON response
        return res.status(httpCode.OK).json({
            status: httpCode.OK,
            message: messageConstant.ROLE_RETRIEVED,
            data: viewRole,
        });
    } catch (error) {
        throw error;
    }
};

/**
 * @function updateRole
 * @param req - The request object containing the parameters and body data.
 * @param res - The response object used to send back the HTTP response.
 * @returns - A promise that resolves to the response object.
 * @description Updates the permissions associated with a specific role. It first removes all existing permissions and then adds the new permissions provided in the request body.
 */
export const updateRole: Controller = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        // Extract the role ID from the request parameters.
        const { id } = req.params;

        const existingRole = await Role.findByPk(id);
        if (!existingRole) {
            await transaction.rollback();
            return res.status(httpCode.BAD_REQUEST).json({
                status: httpCode.BAD_REQUEST,
                message: messageConstant.INVALID_INPUT,
            });
        }

        // Extract the list of permission IDs from the request body.
        const { roleName, accountType, permissionIds } = req.body;

        await Role.update(
            {
                Name: roleName,
                accountType,
            },
            { where: { id }, transaction },
        );

        // Remove all existing permissions associated with the role
        await RolePermissionMap.destroy({
            where: { roleId: id },
            force: true,
            transaction,
        });

        // Add new permissions to the role
        for (const permissionId of permissionIds) {
            await RolePermissionMap.create(
                {
                    roleId: id as unknown as number,
                    permissionId: permissionId,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                { transaction },
            );
        }

        await transaction.commit();

        // Send a success response with a status message.
        return res.status(httpCode.OK).json({
            status: httpCode.OK,
            message: messageConstant.ROLE_UPDATED,
        });
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

/**
 * @function deleteRole
 * @param req - The request object containing the parameters.
 * @param res - The response object used to send back the HTTP response.
 * @returns - A promise that resolves to the response object.
 * @description Deletes a specific role from the database based on the role ID provided in the request parameters.
 */
export const deleteRole: Controller = async (req, res) => {
    try {
        // Extract the role ID from the request parameters.
        const { id } = req.params;

        const existingRole = await Role.findByPk(id);
        if (!existingRole) {
            return res.status(httpCode.BAD_REQUEST).json({
                status: httpCode.BAD_REQUEST,
                message: messageConstant.INVALID_INPUT,
            });
        }

        // Delete the role from the database.
        await Role.destroy({
            where: { id }, // Specify the condition to find the role to delete.
        });

        // Send a success response with a status message.
        return res.status(httpCode.OK).json({
            status: httpCode.OK,
            message: messageConstant.ROLE_DELETED,
        });
    } catch (error) {
        throw error;
    }
};
