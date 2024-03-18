import { Table, Column, Model } from "sequelize-typescript";
import { DataTypes } from "sequelize";
import {
    OrderDetailsAttributes,
    OrderDetailsCreationAttributes,
} from "../../interfaces";

@Table({
    timestamps: true,
    paranoid: true,
})
class OrderDetail extends Model<
    OrderDetailsAttributes,
    OrderDetailsCreationAttributes
> {
    @Column({
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
    })
    id: number;

    @Column({ type: DataTypes.INTEGER, allowNull: false })
    userId: number;

    @Column({ type: DataTypes.INTEGER, allowNull: false })
    vendorId: number;

    @Column({ type: DataTypes.STRING, allowNull: false })
    prescription: string;

    @Column({ type: DataTypes.INTEGER, allowNull: true })
    noOfRefill: number;
}

export default OrderDetail;