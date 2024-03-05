interface UserRegionAttributes {
    regionId: number
    userId: number
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date | null;
}

export { UserRegionAttributes };