import { Optional } from "sequelize";

interface RoleAttributes {
    id: number;
    Name: string;
    accountType: string;
    createdAt: Date;
    updatedAt: Date;
    isDeleted?: boolean;
    deletedAt?: Date;
}

type RoleCreationAttributes = Optional<RoleAttributes, "id">;

export { RoleAttributes, RoleCreationAttributes };
