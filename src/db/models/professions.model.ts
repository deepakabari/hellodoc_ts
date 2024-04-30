import { Table, Column, Model, HasMany } from 'sequelize-typescript';
import { DataTypes } from 'sequelize';
import {
    ProfessionAttributes,
    ProfessionCreationAttributes,
} from '../../interfaces';
import Business from './business.model';

@Table({
    timestamps: true,
    paranoid: true,
})
class Profession extends Model<
    ProfessionAttributes,
    ProfessionCreationAttributes
> {
    @Column({
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
    })
    id: number;

    @Column({
        type: DataTypes.STRING,
        allowNull: false,
    })
    name: string;

    @Column({
        type: DataTypes.BOOLEAN,
        allowNull: true,
    })
    isActive: boolean;

    @HasMany(() => Business, {
        foreignKey: 'professionId',
        sourceKey: 'id',
    })
    businesses: Business[];
}

export default Profession;
