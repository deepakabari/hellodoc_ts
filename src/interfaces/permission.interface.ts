import { Optional } from 'sequelize';

interface PermissionAttributes {
    id: number;
    name: string;
    accountType: string;
    isDeleted?: boolean;
}

type PermissionCreationAttributes = Optional<PermissionAttributes, 'id'>;

export { PermissionAttributes, PermissionCreationAttributes };
