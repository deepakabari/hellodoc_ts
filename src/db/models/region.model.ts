import {
    Table,
    Column,
    Model,
    BelongsToMany,
} from "sequelize-typescript";
import { DataTypes } from "sequelize";
import { RegionAttributes, RegionCreationAttributes } from "../../interfaces/";
import { User, UserRegion } from "./index";

@Table({
    timestamps: true,
    paranoid: true,
})
class Region extends Model<RegionAttributes, RegionCreationAttributes> {
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
        type: DataTypes.STRING,
        allowNull: false,
    })
    abbreviation: string;

    @BelongsToMany(() => User, () => UserRegion, "regionId", "userId")
    users: User[];
}
export default Region;
