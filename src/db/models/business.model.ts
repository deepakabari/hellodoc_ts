import { Table, Column, Model, BelongsTo } from 'sequelize-typescript';
import { DataTypes } from 'sequelize';
import {
    BusinessAttributes,
    BusinessCreationAttributes,
} from '../../interfaces';
import { Profession, User } from './index';

@Table({
    timestamps: true,
    paranoid: true,
})
class Business extends Model<BusinessAttributes, BusinessCreationAttributes> {
    @Column({
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
    })
    id: number;

    @Column({ type: DataTypes.INTEGER, allowNull: false })
    userId: number;

    @Column({ type: DataTypes.STRING, allowNull: false })
    email: string;

    @Column({ type: DataTypes.STRING, allowNull: false })
    phoneNumber: string;

    @Column({ type: DataTypes.STRING, allowNull: false })
    street: string;

    @Column({ type: DataTypes.STRING, allowNull: false })
    city: string;

    @Column({ type: DataTypes.STRING, allowNull: false })
    state: string;

    @Column({ type: DataTypes.STRING, allowNull: false })
    zipCode: string;

    @Column({
        type: DataTypes.STRING,
        allowNull: false,
    })
    accountType: string;

    @Column({
        allowNull: false,
        type: DataTypes.STRING,
    })
    businessName: string;

    @Column({
        allowNull: true,
        type: DataTypes.STRING,
    })
    businessWebsite: string;

    @Column({
        allowNull: true,
        type: DataTypes.INTEGER,
    })
    professionId: number;

    @Column({
        allowNull: true,
        type: DataTypes.STRING,
    })
    faxNumber: string;

    @Column({
        allowNull: true,
        type: DataTypes.STRING,
    })
    businessContact: string;

    @BelongsTo(() => User, { foreignKey: 'userId' })
    user: User;

    @BelongsTo(() => Profession, {
        foreignKey: 'professionId',
        targetKey: 'id',
    })
    profession: Profession;
}

export default Business;
