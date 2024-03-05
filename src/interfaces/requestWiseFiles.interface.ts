import { Optional } from "sequelize";

interface RequestWiseFilesAttributes {
    id: number;
    requestId: number;
    fileName: string;
    docType?: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date | null;
}

type RequestWiseFilesCreationAttributes = Optional<RequestWiseFilesAttributes, "id">;

export { RequestWiseFilesAttributes, RequestWiseFilesCreationAttributes };
