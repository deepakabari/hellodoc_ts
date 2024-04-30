import { Optional } from 'sequelize';

interface ProfessionAttributes {
    id: number;
    name: string;
    isActive: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
}

type ProfessionCreationAttributes = Optional<ProfessionAttributes, 'id'>;

export { ProfessionAttributes, ProfessionCreationAttributes };
