import { Optional } from 'sequelize';

interface RequestWiseFilesAttributes {
    id: number;
    requestId?: number;
    userId?: number
    fileName: string;
    docType?: string;
    isDeleted?: boolean;
    documentPath?: string;
    createdAt: Date
    updatedAt: Date
    deletedAt?: Date | null
}

type RequestWiseFilesCreationAttributes = Optional<
    RequestWiseFilesAttributes,
    'id'
>;

export { RequestWiseFilesAttributes, RequestWiseFilesCreationAttributes };
