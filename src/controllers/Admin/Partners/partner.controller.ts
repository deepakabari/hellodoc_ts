import messageConstant from "../../../constants/message.constant";
import httpCode from "../../../constants/http.constant";
import { Business } from "../../../db/models";
import { Controller } from "../../../interfaces";
import { AccountType } from "../../../utils/enum.constant";

export const addBusiness: Controller = async (req, res) => {
    try {
        const {
            businessName,
            businessWebsite,
            profession,
            faxNumber,
            phoneNumber,
            email,
            businessContact,
            street,
            city,
            state,
            zipCode,
        } = req.body;

        const business = await Business.findOne({
            where: { email },
        });

        if (business) {
            return res.status(httpCode.CONFLICT).json({
                status: httpCode.CONFLICT,
                message: messageConstant.BUSINESS_ALREADY_EXISTS,
            });
        }

        const newBusiness = await Business.create({
            accountType: AccountType.Vendor,
            businessName,
            businessWebsite,
            profession,
            faxNumber,
            phoneNumber,
            email,
            businessContact,
            street,
            city,
            state,
            zipCode,
        });

        return res.status(httpCode.OK).json({
            status: httpCode.OK,
            message: messageConstant.SUCCESS,
            data: newBusiness,
        });
    } catch (error) {
        throw error;
    }
};
