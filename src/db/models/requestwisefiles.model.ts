import { Table, Column, Model, BelongsTo } from "sequelize-typescript";
import { DataTypes } from "sequelize";
import {
    RequestWiseFilesAttributes, RequestWiseFilesCreationAttributes
} from "../../interfaces";
import { Request } from './index'

@Table({
    timestamps: true,
    paranoid: true,
})
class RequestWiseFiles extends Model<RequestWiseFilesAttributes, RequestWiseFilesCreationAttributes> {
    @Column({
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
    })
    id: number

    @Column({
        allowNull: false,
        type: DataTypes.INTEGER,
    })
    requestId: number

    @Column({
        allowNull: false,
        type: DataTypes.STRING,
    })
    fileName: string

    @Column({
        allowNull: true,
        type: DataTypes.STRING,
    })
    docType: string

    @Column({
        allowNull: true,
        type: DataTypes.BOOLEAN,
    })
    isDeleted?: boolean;

    @Column({
        allowNull: true,
        type: DataTypes.STRING,
    })
    documentPath?: string;

    @BelongsTo(() => Request, { foreignKey: "requestId", targetKey: "id"})
    request: Request
}

export default RequestWiseFiles;