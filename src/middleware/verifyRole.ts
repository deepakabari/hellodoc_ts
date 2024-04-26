import { Request, Response, NextFunction } from 'express';
import httpCode from '../constants/http.constant';
import messageConstant from '../constants/message.constant';
import { Permission, Role } from '../db/models/index';
import { logger } from '../utils/logger';

const verifyRole = (requiredPermissions: string[]) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userRoleId = req.user.roleId;

            const roleWithPermissions = await Role.findByPk(userRoleId, {
                include: [
                    {
                        model: Permission,
                        as: 'permissions',
                        through: { attributes: [] },
                    },
                ],
            });

            const hasPermission = requiredPermissions.every(
                (requiredPermissions) =>
                    roleWithPermissions?.permissions.some(
                        (permission) => permission.name === requiredPermissions,
                    ),
            );

            if (!hasPermission) {
                logger.warn('User does not have required permissions', {
                    userRoleId,
                    requiredPermissions,
                });
                return res.status(httpCode.NOT_FOUND).json({
                    status: httpCode.NOT_FOUND,
                    message: messageConstant.ACCESS_DENIED,
                });
            }
            logger.info('User has required permissions', {
                userRoleId,
                requiredPermissions,
            });
            next();
        } catch (error) {
            logger.error('Error verifying permissions', { error });
            return res.status(httpCode.INTERNAL_SERVER_ERROR).json({
                status: httpCode.INTERNAL_SERVER_ERROR,
                message: messageConstant.ERROR_VERIFY_PERMISSION,
            });
        }
    };
};

export default verifyRole;
