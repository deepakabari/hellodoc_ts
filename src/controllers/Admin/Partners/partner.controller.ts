import messageConstant from '../../../constants/message.constant';
import httpCode from '../../../constants/http.constant';
import { Business, OrderDetail } from '../../../db/models';
import { Controller } from '../../../interfaces';
import { AccountType } from '../../../utils/enum.constant';
import { Op } from 'sequelize';
import { sequelize } from '../../../db/config/db.connection';
import { Transaction } from 'sequelize';

/**
 * @function addBusiness
 * @param req - The request object containing the business details.
 * @param res - The response object used to send back the HTTP response.
 * @returns - A promise that resolves to the response object.
 * @description Adds a new business to the database if it does not already exist.
 */
export const addBusiness: Controller = async (req, res) => {
    try {
        const {
            businessName,
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
            userId: req.user.id,
            businessName,
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
            message: messageConstant.BUSINESS_ADDED,
            data: newBusiness,
        });
    } catch (error) {
        throw error;
    }
};

/**
 * @function viewBusiness
 * @param req - The HTTP request object, containing the request parameters.
 * @param res - The HTTP response object used for sending responses back to the client.
 * @returns - A promise that resolves to the HTTP response with the business details or an error message.
 * @description - retrieves the business details of a business by it's ID.
 */
export const viewBusiness: Controller = async (req, res) => {
    try {
        const { id } = req.params;
        const viewBusiness = await Business.findAll({
            attributes: [
                'id',
                'businessName',
                'profession',
                'faxNumber',
                'phoneNumber',
                'email',
                'businessContact',
                'street',
                'city',
                'state',
                'zipCode',
            ],
            where: { id },
        });

        if (viewBusiness.length === 0) {
            return res.status(httpCode.BAD_REQUEST).json({
                status: httpCode.BAD_REQUEST,
                message: messageConstant.DATA_NOT_FOUND,
            });
        }

        return res.status(httpCode.OK).json({
            status: httpCode.OK,
            message: messageConstant.BUSINESS_RETRIEVED,
            data: viewBusiness,
        });
    } catch (error) {
        throw error;
    }
};

/**
 * @function professions
 * @param req - The request object.
 * @param res - The response object used to send back the HTTP response.
 * @returns - A promise that resolves to the response object.
 * @description Retrieves a list of unique professions from the Business table.
 */
export const professions: Controller = async (req, res) => {
    try {
        const professions = await Business.findAll({
            attributes: ['profession'],
            group: ['profession'],
        });

        return res.status(httpCode.OK).json({
            status: httpCode.OK,
            message: messageConstant.SUCCESS,
            data: professions,
        });
    } catch (error) {
        throw error;
    }
};

/**
 * @function businessByProfession
 * @param req - The request object containing the profession parameter.
 * @param res - The response object used to send back the HTTP response.
 * @returns - A promise that resolves to the response object.
 * @description Fetches all businesses that match the given profession.
 */
export const businessByProfession: Controller = async (req, res) => {
    try {
        const { profession } = req.params;
        const businessByProfession = await Business.findAll({
            attributes: ['id', 'businessName'],
            where: { profession: profession },
        });

        return res.status(httpCode.OK).json({
            status: httpCode.OK,
            message: messageConstant.SUCCESS,
            data: businessByProfession,
        });
    } catch (error) {
        throw error;
    }
};

/**
 * @function viewSendOrder
 * @param req - The request object containing the business ID parameter.
 * @param res - The response object used to send back the HTTP response.
 * @returns - A promise that resolves to the response object.
 * @description Retrieves the contact details of a business by its ID.
 */
export const viewSendOrder: Controller = async (req, res) => {
    try {
        const { id } = req.params;

        const businessDetails = await Business.findAll({
            attributes: ['id', 'businessContact', 'email', 'faxNumber'],
            where: { id },
        });

        return res.status(httpCode.OK).json({
            status: httpCode.OK,
            message: messageConstant.SUCCESS,
            data: businessDetails,
        });
    } catch (error) {
        throw error;
    }
};

/**
 * @function sendOrder
 * @param req - The request object containing the order details and user ID.
 * @param res - The response object used to send back the HTTP response.
 * @returns - A promise that resolves to the response object.
 * @description Creates a new order with the given details and associates it with the user and vendor.
 */
export const sendOrder: Controller = async (req, res) => {
    try {
        const id = +req.params.id;
        const { prescription, noOfRefill } = req.body;

        const sendOrder = await OrderDetail.create({
            userId: req.user.id,
            vendorId: id,
            prescription,
            noOfRefill,
        });

        return res.status(httpCode.OK).json({
            status: httpCode.OK,
            message: messageConstant.ORDER_SENT,
            data: sendOrder,
        });
    } catch (error) {
        throw error;
    }
};

export const viewVendor: Controller = async (req, res) => {
    try {
        const { search, professions, page, pageSize } = req.query;

        const pageNumber = parseInt(page as string, 10) || 1;
        const limit = parseInt(pageSize as string, 10) || 10;
        const offset = (pageNumber - 1) * limit;

        const viewVendor = await Business.findAndCountAll({
            attributes: [
                'id',
                'profession',
                'businessName',
                'email',
                'faxNumber',
                'phoneNumber',
                'businessContact',
            ],
            where: {
                ...(search
                    ? {
                          businessName: { [Op.substring]: `${search}` },
                      }
                    : {}),
                ...(professions ? { profession: professions as string } : {}),
            },
            limit,
            offset,
        });
        return res.status(httpCode.OK).json({
            status: httpCode.OK,
            message: messageConstant.VENDOR_RETRIEVED,
            data: viewVendor,
        });
    } catch (error) {
        throw error;
    }
};

export const updateBusiness: Controller = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            businessName,
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

        const transaction = await sequelize.transaction();

        await Business.update(
            {
                businessName,
                profession,
                faxNumber,
                phoneNumber,
                email,
                businessContact,
                street,
                city,
                state,
                zipCode,
            },
            { where: { id }, transaction: transaction },
        );

        // If the update is successful, commit the transaction
        await transaction.commit();

        return res.status(httpCode.OK).json({
            status: httpCode.OK,
            message: messageConstant.BUSINESS_UPDATED,
        });
    } catch (error) {
        throw error;
    }
};

export const deleteBusiness: Controller = async (req, res) => {
    try {
        const { id } = req.params;

        await Business.destroy({
            where: { id },
        });

        return res.status(httpCode.OK).json({
            status: httpCode.OK,
            message: messageConstant.BUSINESS_DELETED,
        });
    } catch (error) {
        throw error;
    }
};
