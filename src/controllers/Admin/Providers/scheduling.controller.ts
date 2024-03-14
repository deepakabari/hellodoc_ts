import {
    AccountType,
    OnCallStatus,
} from "../../../utils/enum.constant";
import httpCode from "../../../constants/http.constant";
import messageConstant from "../../../constants/message.constant";
import {
    Region,
    User,
} from "../../../db/models/index";
import { Controller } from "../../../interfaces";
import dotenv from "dotenv";
import { Op } from "sequelize";
dotenv.config();

interface Provider {
    id: number;
    firstName: string;
    lastName: string;
    photo: string;
    regions: object;
}

interface Group {
    [key: string]: Provider[];
}


export const providerOnCall: Controller = async (req, res) => {
    try {
        const providers = await User.findAll({
            attributes: [
                "id",
                "photo",
                "firstName",
                "lastName",
                "onCallStatus",
            ],
            where: {
                accountType: AccountType.Physician,
                onCallStatus: {
                    [Op.or]: [OnCallStatus.OnCall, OnCallStatus.UnAvailable],
                },
            },
            include: [
                {
                    model: Region,
                    attributes: ["id", "name"],
                    through: { attributes: [] }, // This will exclude the join table attributes
                },
            ],
            order: ["onCallStatus"],
        });

        const groupedProvider: Group = providers.reduce(
            (result: Group, user) => {
                const key = user.onCallStatus;
                if (!result[key]) {
                    result[key] = [];
                }
                result[key].push({
                    id: user.id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    photo: user.photo,
                    regions: user.regions.map((region) => ({
                        id: region.id,
                        name: region.name,
                    })),
                });
                return result;
            },
            {} as Group
        );

        return res.status(httpCode.OK).json({
            status: httpCode.OK,
            message: messageConstant.SUCCESS,
            data: groupedProvider,
        });
    } catch (error) {
        throw error;
    }
};
