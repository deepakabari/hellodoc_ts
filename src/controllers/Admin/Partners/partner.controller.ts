import messageConstant from '../../../constants/message.constant';
import httpCode from '../../../constants/http.constant';
import { Business, OrderDetail, Profession } from '../../../db/models';
import { Controller } from '../../../interfaces';
import { AccountType } from '../../../utils/enum.constant';
import { Op } from 'sequelize';

/**
 * @function addBusiness
 * @param req - The request object containing the business details.
 * @param res - The response object used to send back the HTTP response.
 * @returns - A promise that resolves to the response object.
 * @description Adds a new business to the database if it does not already exist.
 */
export const addBusiness: Controller = async (req, res) => {
    try {
        // Extract business information from request body
        const {
            businessName,
            professionId,
            faxNumber,
            phoneNumber,
            email,
            businessContact,
            street,
            city,
            state,
            zipCode,
        } = req.body;

        // Check if business with the same email already exists
        const business = await Business.findOne({
            where: { email, businessName },
        });

        if (business) {
            return res.status(httpCode.CONFLICT).json({
                status: httpCode.CONFLICT,
                message: messageConstant.BUSINESS_ALREADY_EXISTS,
            });
        }

        // Create new business record
        const newBusiness = await Business.create({
            accountType: AccountType.Vendor,
            userId: req.user.id,
            businessName,
            professionId,
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
        // Extract business ID from request parameters
        const { id } = req.params;

        // Find business by ID
        const existingBusiness = await Business.findByPk(id);
        if (!existingBusiness) {
            return res.status(httpCode.BAD_REQUEST).json({
                status: httpCode.BAD_REQUEST,
                message: messageConstant.INVALID_INPUT,
            });
        }

        // Retrieve business details
        const viewBusiness = await Business.findAll({
            attributes: [
                'id',
                'businessName',
                'faxNumber',
                'phoneNumber',
                'email',
                'businessContact',
                'street',
                'city',
                'state',
                'zipCode',
            ],
            include: [
                {
                    model: Profession,
                    attributes: ['id', 'name'],
                    required: false,
                },
            ],
            where: { id },
        });

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
        // Retrieve list of unique professions
        const professions = await Profession.findAll({
            attributes: ['id', 'name'],
            group: ['name'],
        });

        if (!professions) {
            return res.status(httpCode.BAD_REQUEST).json({
                status: httpCode.BAD_REQUEST,
                message: messageConstant.DATA_NOT_FOUND,
            });
        }

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
        // Extract profession from request parameters
        const { professionId } = req.params;

        // Find businesses by profession
        const businessByProfession = await Business.findAll({
            attributes: ['id', 'businessName'],
            where: { professionId },
        });

        if (!businessByProfession) {
            return res.status(httpCode.BAD_REQUEST).json({
                status: httpCode.BAD_REQUEST,
                message: messageConstant.DATA_NOT_FOUND,
            });
        }

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
        // Extract business ID from request parameters
        const { id } = req.params;

        // Check if business with the given ID exists
        const existingBusiness = await Business.findByPk(id);
        if (!existingBusiness) {
            return res.status(httpCode.BAD_REQUEST).json({
                status: httpCode.BAD_REQUEST,
                message: messageConstant.INVALID_INPUT,
            });
        }

        // Retrieve business details by ID
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
        // Extract vendor ID from request parameters
        const id = +req.params.id;

        // Extract prescription and number of refills from request body
        const { prescription, noOfRefill } = req.body;

        // Create order detail
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
        // Extract query parameters
        const { search, professions, page, pageSize } = req.query;

        // Extract pagination parameters
        const pageNumber = parseInt(page as string, 10) || 1;
        const limit = parseInt(pageSize as string, 10) || 10;
        const offset = (pageNumber - 1) * limit;

        // Retrieve vendors based on search criteria
        const viewVendor = await Business.findAndCountAll({
            attributes: [
                'id',
                'professionId',
                'businessName',
                'email',
                'faxNumber',
                'phoneNumber',
                'businessContact',
            ],
            include: [
                {
                    model: Profession,
                    attributes: ['id', 'name'],
                    where: {
                        ...(professions ? { name: professions as string } : {}),
                    },
                },
            ],
            where: {
                ...(search
                    ? {
                          businessName: { [Op.substring]: `${search}` },
                      }
                    : {}),
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
        // Extract business ID from request parameters
        const { id } = req.params;

        // Extract business details from request body
        const {
            businessName,
            professionId,
            faxNumber,
            phoneNumber,
            email,
            businessContact,
            street,
            city,
            state,
            zipCode,
        } = req.body;

        // Check if business with the given ID exists
        const existingBusiness = await Business.findByPk(id);
        if (!existingBusiness) {
            return res.status(httpCode.BAD_REQUEST).json({
                status: httpCode.BAD_REQUEST,
                message: messageConstant.INVALID_INPUT,
            });
        }

        if (
            existingBusiness.email === email ||
            existingBusiness.businessName === businessName
        ) {
            return res.status(httpCode.CONFLICT).json({
                status: httpCode.CONFLICT,
                message: messageConstant.EMAIL_NAME_EXISTS,
            });
        }

        // Update business details
        await Business.update(
            {
                businessName,
                professionId,
                faxNumber,
                phoneNumber,
                email,
                businessContact,
                street,
                city,
                state,
                zipCode,
            },
            { where: { id } },
        );

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
        // Extract business ID from request parameters
        const { id } = req.params;

        // Check if business with the given ID exists
        const existingBusiness = await Business.findByPk(id);
        if (!existingBusiness) {
            return res.status(httpCode.BAD_REQUEST).json({
                status: httpCode.BAD_REQUEST,
                message: messageConstant.INVALID_INPUT,
            });
        }

        // Delete the business
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
