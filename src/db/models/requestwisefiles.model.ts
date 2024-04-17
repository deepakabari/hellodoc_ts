import { Table, Column, Model, BelongsTo } from 'sequelize-typescript';
import { DataTypes } from 'sequelize';
import {
    RequestWiseFilesAttributes,
    RequestWiseFilesCreationAttributes,
} from '../../interfaces';
import { Request, User } from './index';

@Table({
    timestamps: true,
    paranoid: true,
})
class RequestWiseFiles extends Model<
    RequestWiseFilesAttributes,
    RequestWiseFilesCreationAttributes
> {
    @Column({
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
    })
    id: number;

    @Column({
        allowNull: true,
        type: DataTypes.INTEGER,
    })
    requestId: number;

    @Column({
        allowNull: true,
        type: DataTypes.INTEGER,
    })
    userId: number;

    @Column({
        allowNull: false,
        type: DataTypes.STRING,
    })
    fileName: string;

    @Column({
        allowNull: true,
        type: DataTypes.STRING,
    })
    docType: string;

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

    @BelongsTo(() => Request, { foreignKey: 'requestId', targetKey: 'id' })
    request: Request;

    @BelongsTo(() => User, { foreignKey: 'userId', targetKey: 'id' })
    user: User;
}

export default RequestWiseFiles;
