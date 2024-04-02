import {
    Table,
    Column,
    Model,
    BelongsToMany,
    HasMany,
    HasOne,
    BelongsTo,
} from 'sequelize-typescript';
import { DataTypes } from 'sequelize';
import { UserAttributes, UserCreationAttributes } from '../../interfaces';
import {
    Role,
    Request,
    Region,
    UserRegion,
    Shift,
    RequestWiseFiles,
} from './index';

@Table({
    timestamps: true,
    paranoid: true,
})
class User extends Model<UserAttributes, UserCreationAttributes> {
    @Column({
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
    })
    id: number;

    @Column({ type: DataTypes.STRING, allowNull: true })
    userName: string;

    @Column({ type: DataTypes.STRING, allowNull: false })
    email: string;

    @Column({ type: DataTypes.STRING, allowNull: true })
    password: string;

    @Column({ type: DataTypes.INTEGER, allowNull: true })
    roleId: number;

    @Column({ type: DataTypes.STRING, allowNull: true })
    firstName: string;

    @Column({ type: DataTypes.STRING, allowNull: true })
    lastName: string;

    @Column({ type: DataTypes.STRING, allowNull: true })
    phoneNumber: string;

    @Column({ type: DataTypes.STRING, allowNull: true })
    address1: string;

    @Column({ type: DataTypes.STRING, allowNull: true })
    address2: string;

    @Column({ type: DataTypes.STRING, allowNull: true })
    street: string;

    @Column({ type: DataTypes.STRING, allowNull: true })
    city: string;

    @Column({ type: DataTypes.STRING, allowNull: true })
    state: string;

    @Column({ type: DataTypes.STRING, allowNull: true })
    zipCode: string;

    @Column({ type: DataTypes.DATEONLY, allowNull: true })
    dob: Date;

    @Column({ type: DataTypes.STRING, allowNull: true })
    altPhone: string;

    @Column({ type: DataTypes.STRING, allowNull: true })
    status: string;

    @Column({
        type: DataTypes.STRING,
        allowNull: true,
    })
    accountType: string;

    @Column({ type: DataTypes.STRING, allowNull: true })
    medicalLicense: string;

    @Column({ type: DataTypes.STRING, allowNull: true })
    photo: string;

    @Column({ type: DataTypes.STRING, allowNull: true })
    signature: string;

    @Column({ type: DataTypes.BOOLEAN, allowNull: true })
    isAgreementDoc: boolean;

    @Column({ type: DataTypes.BOOLEAN, allowNull: true })
    isBackgroundDoc: boolean;

    @Column({ type: DataTypes.BOOLEAN, allowNull: true })
    isTrainingDoc: boolean;

    @Column({ type: DataTypes.BOOLEAN, allowNull: true })
    isNonDisclosureDoc: boolean;

    @Column({ type: DataTypes.BOOLEAN, allowNull: true })
    isLicenseDoc: boolean;

    @Column({ type: DataTypes.STRING, allowNull: true })
    NPINumber: string;

    @Column({ type: DataTypes.STRING, allowNull: true })
    syncEmailAddress: string;

    @Column({ type: DataTypes.STRING, allowNull: true })
    resetToken: string;

    @Column({ type: DataTypes.DATE, allowNull: true })
    expireToken: Date;

    @Column({ type: DataTypes.STRING, allowNull: true })
    onCallStatus: string;

    @Column({
        allowNull: true,
        type: DataTypes.BOOLEAN,
    })
    isDeleted?: boolean;

    @Column({
        allowNull: true,
        type: DataTypes.BOOLEAN,
    })
    notification: boolean;

    @HasMany(() => Request, {
        foreignKey: 'userId',
        sourceKey: 'id',
        as: 'userRequest',
    })
    userRequests: Request[];

    @HasMany(() => Request, {
        foreignKey: 'physicianId',
        sourceKey: 'id',
        as: 'physicianRequest',
    })
    physicianRequests: Request[];

    @BelongsToMany(() => Region, () => UserRegion, 'userId', 'regionId')
    regions: Region[];

    @HasMany(() => Shift, {
        foreignKey: 'physicianId',
        sourceKey: 'id',
        as: 'physicianShift',
    })
    physicianShifts: Shift[];

    @HasMany(() => RequestWiseFiles, {
        foreignKey: 'requestId',
        sourceKey: 'id',
    })
    requestWiseFiles: RequestWiseFiles[];

    @BelongsTo(() => Role, {
        foreignKey: 'roleId',
        as: 'role'
    })
    role: Role;
}
export default User;
