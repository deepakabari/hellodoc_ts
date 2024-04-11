import { Table, Column, Model } from 'sequelize-typescript';
import { DataTypes } from 'sequelize';
import {
    BusinessAttributes,
    BusinessCreationAttributes,
} from '../../interfaces';

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
        type: DataTypes.STRING,
    })
    profession: string;

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
}

export default Business;
