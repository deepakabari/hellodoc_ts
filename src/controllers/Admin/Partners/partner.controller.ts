import messageConstant from '../../../constants/message.constant';
import httpCode from '../../../constants/http.constant';
import { Business, OrderDetail } from '../../../db/models';
import { Controller } from '../../../interfaces';
import { AccountType } from '../../../utils/enum.constant';

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
            userId: req.user.id,
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

        if (!viewBusiness) {
            return res.status(httpCode.NOT_FOUND).json({
                status: httpCode.NOT_FOUND,
                message: messageConstant.DATA_NOT_FOUND,
            });
        }

        return res.status(httpCode.OK).json({
            status: httpCode.OK,
            message: messageConstant.SUCCESS,
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
            message: messageConstant.SUCCESS,
            data: sendOrder,
        });
    } catch (error) {
        throw error;
    }
};
