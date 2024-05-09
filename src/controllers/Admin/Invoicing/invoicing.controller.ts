import httpCode from '../../../constants/http.constant';
import messageConstant from '../../../constants/message.constant';
import { Controller } from '../../../interfaces';
import { PayRate, WeeklyTimesheet } from '../../../db/models/index';

// Controller to get a specific pay rate by ID
export const getPayRate: Controller = async (req, res) => {
    try {
        // Extracting the ID from request parameters
        const { id } = req.params;

        // Checking if the pay rate exists in the database
        const existsPayRate = await PayRate.findByPk(id);
        // If not found, return a BAD_REQUEST response
        if (!existsPayRate) {
            return res.status(httpCode.BAD_REQUEST).json({
                status: httpCode.BAD_REQUEST,
                message: messageConstant.PAYRATE_NOT_FOUND,
            });
        }

        // If found, retrieve the pay rate details
        const getPayRate = await PayRate.findAll({
            where: { id },
        });

        // Return the pay rate details with an OK status
        return res.status(httpCode.OK).json({
            status: httpCode.OK,
            message: messageConstant.PAYRATE_RETRIEVED,
            data: getPayRate,
        });
    } catch (error) {
        throw error;
    }
};

// Controller to add a new pay rate
export const addPayRate: Controller = async (req, res) => {
    try {
        // Extracting pay rate details from the request body
        const {
            physicianId,
            nightShiftWeekend,
            shift,
            houseCallNightWeekend,
            phoneConsult,
            phoneConsultNightWeekend,
            batchTesting,
            houseCall,
        } = req.body;

        // Check if a pay rate for the given physician already exists
        const existsPayRate = await PayRate.findOne({
            where: { physicianId },
        });
        // If it exists, return a BAD_REQUEST response
        if (existsPayRate) {
            return res.status(httpCode.BAD_REQUEST).json({
                status: httpCode.BAD_REQUEST,
                message: messageConstant.PAYRATE_ALREADY_EXISTS,
            });
        }

        // If not, create a new pay rate record
        const addPayRate = await PayRate.create({
            physicianId,
            nightShiftWeekend,
            shift,
            houseCallNightWeekend,
            phoneConsult,
            phoneConsultNightWeekend,
            batchTesting,
            houseCall,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        // If creation fails, return a BAD_REQUEST response
        if (!addPayRate) {
            return res.status(httpCode.BAD_REQUEST).json({
                status: httpCode.BAD_REQUEST,
                message: messageConstant.PAYRATE_CREATION_FAILED,
            });
        }

        // If successful, return the newly created pay rate with an OK status
        return res.status(httpCode.OK).json({
            status: httpCode.OK,
            message: messageConstant.PAYRATE_CREATED,
            data: addPayRate,
        });
    } catch (error) {
        throw error;
    }
};

// Controller to edit an existing pay rate
export const editPayrate: Controller = async (req, res) => {
    try {
        // Extracting updated pay rate details from the request body
        const {
            physicianId,
            nightShiftWeekend,
            shift,
            houseCallNightWeekend,
            phoneConsult,
            phoneConsultNightWeekend,
            batchTesting,
            houseCall,
        } = req.body;

        // Check if the pay rate to be edited exists
        const existsPayRate = await PayRate.findOne({
            where: { physicianId },
        });
        // If not found, return a BAD_REQUEST response
        if (!existsPayRate) {
            return res.status(httpCode.BAD_REQUEST).json({
                status: httpCode.BAD_REQUEST,
                message: messageConstant.PAYRATE_NOT_FOUND,
            });
        }

        // If found, update the pay rate with the new details
        await PayRate.update(
            {
                nightShiftWeekend,
                shift,
                houseCallNightWeekend,
                phoneConsult,
                phoneConsultNightWeekend,
                batchTesting,
                houseCall,
            },
            { where: { physicianId } },
        );

        // Return a success message with an OK status
        return res.status(httpCode.OK).json({
            status: httpCode.OK,
            message: messageConstant.PAYRATE_EDITED,
        });
    } catch (error) {
        throw error;
    }
};

export const viewTimeSheet: Controller = async (req, res) => {
    try {
        const { id } = req.params;
        const { startDate } = req.body;

        // Checking if weekly timesheet record exists
        const existsInvoice = await WeeklyTimesheet.findOne({
            where: { physicianId: id, startDate },
        });

        // Handling case where weekly timesheet record does not exist
        if (!existsInvoice) {
            return res.status(httpCode.BAD_REQUEST).json({
                status: httpCode.BAD_REQUEST,
                message: messageConstant.INVALID_INPUT,
            });
        }

        const viewTimeSheet = await WeeklyTimesheet.findAndCountAll({
            attributes: ['id', 'startDate', 'endDate', 'status'],
            where: {
                physicianId: id,
                startDate,
                isFinalize: true,
            },
        });

        if (!viewTimeSheet.count) {
            return res.status(httpCode.BAD_REQUEST).json({
                status: httpCode.BAD_REQUEST,
                message: messageConstant.TIME_SHEET_NOT_FOUND,
            });
        }

        return res.status(httpCode.OK).json({
            status: httpCode.OK,
            message: messageConstant.TIME_SHEET_RETRIEVED,
            data: viewTimeSheet,
        });
    } catch (error) {
        throw error;
    }
};

export const approveTimesheet: Controller = async (req, res) => {
    try {
        const { id } = req.params;
        const { startDate } = req.body;

        // Checking if weekly timesheet record exists
        const existsInvoice = await WeeklyTimesheet.findOne({
            where: { physicianId: id, startDate },
        });

        // Handling case where weekly timesheet record does not exist
        if (!existsInvoice) {
            return res.status(httpCode.BAD_REQUEST).json({
                status: httpCode.BAD_REQUEST,
                message: messageConstant.INVALID_INPUT,
            });
        }

        await WeeklyTimesheet.update(
            { status: 1 },
            { where: { physicianId: id, startDate } },
        );

        return res.status(httpCode.OK).json({
            status: httpCode.OK,
            message: messageConstant.TIME_SHEET_APPROVED,
        });
    } catch (error) {
        throw error;
    }
};
