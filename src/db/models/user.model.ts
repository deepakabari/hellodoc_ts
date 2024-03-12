import {
    Table,
    Column,
    Model,
    BelongsToMany,
    HasMany,
} from "sequelize-typescript";
import { DataTypes } from "sequelize";
import { UserAttributes, UserCreationAttributes } from "../../interfaces";
import { Role, UserRole, Request, Region, UserRegion } from "./index";
import { Joi, Segments } from "celebrate";

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

    @Column({ type: DataTypes.STRING, allowNull: false })
    userName: string;

    @Column({ type: DataTypes.STRING, allowNull: false })
    email: string;

    @Column({ type: DataTypes.STRING, allowNull: false })
    password: string;

    @Column({ type: DataTypes.STRING, allowNull: false })
    firstName: string;

    @Column({ type: DataTypes.STRING, allowNull: true })
    lastName: string;

    @Column({ type: DataTypes.STRING, allowNull: false })
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

    @Column({ type: DataTypes.STRING, allowNull: false })
    zipCode: string;

    @Column({ type: DataTypes.DATEONLY, allowNull: true })
    dob: Date;

    @Column({ type: DataTypes.STRING, allowNull: true })
    altPhone: string;

    @Column({ type: DataTypes.STRING, allowNull: true })
    status: string;

    @Column({ type: DataTypes.STRING, allowNull: false })
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
    notification: boolean

    @Column({
        allowNull: true,
        type: DataTypes.STRING,
    })
    businessName: string

    @Column({
        allowNull: true,
        type: DataTypes.STRING,
    })
    businessWebsite: string

    @BelongsToMany(() => Role, () => UserRole, "userId", "roleId")
    roles: Role[];

    @HasMany(() => Request, {
        foreignKey: "userId",
        sourceKey: "id",
        as: "userRequest",
    })
    userRequests: Request[];

    @HasMany(() => Request, {
        foreignKey: "physicianId",
        sourceKey: "id",
        as: "physicianRequest",
    })
    physicianRequests: Request[];

    @BelongsToMany(() => Region, () => UserRegion, "userId", "regionId")
    regions: Region[];
}
export { User };

export const UserSchema = {
    createUser: {
        [Segments.BODY]: Joi.object({
            userName: Joi.string().required(),
            password: Joi.string()
                .required()
                .regex(
                    RegExp(
                        "^(?=.*[!@#$%^&*(),.?:{}|<>])(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9]).{8,16}$"
                    )
                ),
            firstName: Joi.string().required().min(2),
            lastName: Joi.string().allow("").optional().min(4),
            email: Joi.string().email().required(),
            phoneNumber: Joi.string().min(10).max(10).required(),
            address1: Joi.string().allow("").optional(),
            address2: Joi.string().allow("").optional(),
            street: Joi.string().allow("").optional(),
            city: Joi.string().required(),
            state: Joi.string().required(),
            zipCode: Joi.string().required().equal(5),
            dob: Joi.date().allow("").optional(),
            status: Joi.string().allow("").optional(),
            altPhone: Joi.string().optional().min(10).max(10).allow(""),
            medicalLicense: Joi.string().optional().allow(""),
            photo: Joi.string().optional().allow(""),
            signature: Joi.string().optional().allow(""),
            isAgreementDoc: Joi.boolean().optional(),
            isBackgroundDoc: Joi.boolean().optional(),
            isTrainingDoc: Joi.boolean().optional(),
            isNonDisclosureDoc: Joi.boolean().optional(),
            isLicenseDoc: Joi.boolean().optional(),
            NPINumber: Joi.string().optional().allow(""),
            syncEmailAddress: Joi.string().optional().allow(""),
            regions: Joi.array().items(Joi.number().integer()).required(),
        }),
    },

    isEmailFound: {
        [Segments.BODY]: Joi.object({
            patientEmail: Joi.string().email().required(),
        }),
    },

    login: {
        [Segments.BODY]: Joi.object({
            email: Joi.string().required().email(),
            password: Joi.string()
                .required()
                .regex(
                    RegExp(
                        "^(?=.*[!@#$%^&*(),.?:{}|<>])(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9]).{8,16}$"
                    )
                ),
        }),
    },

    forgotPassword: {
        [Segments.BODY]: Joi.object({
            email: Joi.string().email().required(),
        }),
    },

    resetPassword: {
        [Segments.BODY]: Joi.object({
            newPassword: Joi.string()
                .required()
                .regex(
                    RegExp(
                        "^(?=.*[!@#$%^&*(),.?:{}|<>])(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9]).{8,16}$"
                    )
                ),
            confirmPassword: Joi.string()
                .required()
                .regex(
                    RegExp(
                        "^(?=.*[!@#$%^&*(),.?:{}|<>])(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9]).{8,16}$"
                    )
                ),
        }),
        [Segments.PARAMS]: {
            hash: Joi.string().required()
        }
    },

    sendPatientRequest: {
        [Segments.BODY]: Joi.object({
            firstName: Joi.string().required(),
            lastName: Joi.string().required(),
            phoneNumber: Joi.string().required().min(10).max(10),
            email: Joi.string().email().required()
        })
    }
};
