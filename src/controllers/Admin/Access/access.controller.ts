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
dotenv.config();

interface RoleGroup {
    [key: string]: string[];
}

/**
 * Handles the HTTP request to retrieve account access roles.
 * @param req - The Express Request object containing the incoming request data.
 * @param res - The Express Response object used to send back the desired HTTP response.
 * @returns - A promise that resolves to the Express Response object, which sends a JSON response containing the status code, success message, and the retrieved account access data.
 */
export const accountAccess: Controller = async (req, res) => {
    try {
        const { sortBy, orderBy, page, pageSize } = req.query;

        const pageNumber = parseInt(page as string, 10) || 1;
        const limit = parseInt(pageSize as string, 10) || 10;
        const offset = (pageNumber - 1) * limit;

        let sortByModel: Order = [];

        if (sortBy && orderBy) {
            sortByModel = [[sortBy, orderBy]] as Order;
        }
        const accountAccess = await Role.findAll({
            attributes: ['id', 'Name', 'accountType'],
            order: sortByModel,
            limit,
            offset,
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
        const { accountTypes } = req.query;
        const roles = await Permission.findAll({
            attributes: ['accountType', 'name'],
            order: ['accountType'],
            where: {
                ...(accountTypes
                    ? { accountType: accountTypes as string }
                    : {}),
            },
        });

        const groupedRoles: RoleGroup = roles.reduce(
            (result: RoleGroup, role) => {
                const key = role.accountType;
                if (!result[key]) {
                    result[key] = [];
                }
                result[key].push(role.name);
                return result;
            },
            {} as RoleGroup,
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
        const { roleName, accountType, permissionIds } = req.body;

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

        for (const permissionId of permissionIds) {
            await RolePermissionMap.create({
                roleId: createRole.id,
                permissionId,
            });
        }

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
        const { accountType, sortBy, orderBy, page, pageSize } = req.query;

        const pageNumber = parseInt(page as string, 10) || 1;
        const limit = parseInt(pageSize as string, 10) || 10;
        const offset = (pageNumber - 1) * limit;

        let sortByModel: Order = [];

        if (sortBy && orderBy) {
            sortByModel = [[sortBy, orderBy]] as Order;
        }

        let whereCondition: { [key: string]: any } = {};
        if (accountType && accountType !== 'All') {
            whereCondition['accountType'] = accountType;
        }

        const users = await User.findAll({
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

        return res.status(httpCode.OK).json({
            status: httpCode.OK,
            message: messageConstant.SUCCESS,
            data: users,
        });
    } catch (error) {
        throw error;
    }
};
