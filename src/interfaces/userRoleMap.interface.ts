interface UserRoleAttributes {
    roleId: number;
    userId: number;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date | null;
}

export { UserRoleAttributes };
