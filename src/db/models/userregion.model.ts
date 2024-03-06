import { Table, Column, Model } from "sequelize-typescript";
import { DataTypes } from "sequelize";
import { UserRegionAttributes } from "../../interfaces";

@Table({
    timestamps: true,
    paranoid: true,
    indexes: [
        {
            unique: true,
            fields: ["userId", "regionId"],
        },
    ],
})
class UserRegion extends Model<UserRegionAttributes> {
    @Column({
        type: DataTypes.INTEGER,
        allowNull: false,
    })
    userId: number;

    @Column({
        type: DataTypes.INTEGER,
        allowNull: false,
    })
    regionId: number;
}
export default UserRegion;
