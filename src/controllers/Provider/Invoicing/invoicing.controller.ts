import httpCode from '../../../constants/http.constant';
import messageConstant from '../../../constants/message.constant';
import { Controller } from '../../../interfaces';
import {
    PayRate,
    TimesheetDetail,
    WeeklyTimesheet,
} from '../../../db/models/index';

export const insertWeeklyRecords: Controller = async (req, res) => {
    try {
        // Extracting necessary data from the request body
        const { startDate, endDate, details } = req.body;
        const physicianId = req.user.id;

        // Finding or creating a weekly timesheet record based on physicianId and startDate
        let weeklyTimeSheet = await WeeklyTimesheet.findOne({
            where: {
                physicianId,
                startDate,
            },
        });

        // Finding the pay rate for the physician
        const payRate = await PayRate.findOne({ where: { physicianId } });

        // Handling case where pay rate is not found
        if (!payRate) {
            return res.status(httpCode.BAD_REQUEST).json({
                status: httpCode.BAD_REQUEST,
                message: messageConstant.PAYRATE_NOT_FOUND,
            });
        }

        // Creating a new weekly timesheet record if not found
        if (!weeklyTimeSheet) {
            weeklyTimeSheet = await WeeklyTimesheet.create({
                startDate,
                endDate,
                physicianId,
                status: 0,
                payRateId: payRate ? payRate.id : null,
            });
        }

        // Handling file uploads
        if (!req.files || !('bill[day]' in req.files)) {
            console.log('File not uploaded');
        }

        // Extracting uploaded files from request
        const uploadedFiles = req.files as {
            [fieldname: string]: Express.Multer.File[];
        };

        // Looping through details and creating timesheet details records
        for (const data of details) {
            const day = new Date(data.date).getDate();
            const fieldName = `bill[${day}]`;
            const fileArray = uploadedFiles[fieldName];
            const file = fileArray ? fileArray[0] : null;

            // Creating a timesheet detail record
            await TimesheetDetail.create({
                timesheetId: weeklyTimeSheet.id,
                date: data.date,
                onCallHours: data.onCallHours,
                totalHours: data.totalHours,
                houseCall: data.houseCall,
                phoneConsult: data.phoneConsult,
                item: data.item,
                amount: data.amount,
                bill: file ? file.filename : null,
                isHoliday: data.isHoliday,
                createdAt: new Date(),
                updatedAt: new Date(),
            });
        }

        // Sending success response
        return res.status(httpCode.OK).json({
            status: httpCode.OK,
            message: messageConstant.TIME_SHEET_CREATED,
            data: weeklyTimeSheet,
        });
    } catch (error) {
        throw error;
    }
};

export const finalizeRecord: Controller = async (req, res) => {
    try {
        const physicianId = req.user.id;

        // Checking if weekly timesheet record exists
        const exists = await WeeklyTimesheet.findOne({
            where: { physicianId },
        });

        // Handling case where weekly timesheet record does not exist
        if (!exists) {
            return res.status(httpCode.BAD_REQUEST).json({
                status: httpCode.BAD_REQUEST,
                message: messageConstant.INVALID_INPUT,
            });
        }

        // Updating the isFinalize flag for the weekly timesheet record
        await WeeklyTimesheet.update(
            {
                isFinalize: true,
            },
            {
                where: { physicianId },
            },
        );

        // Sending response indicating form is finalized
        return res.status(httpCode.OK).json({
            status: httpCode.OK,
            message: messageConstant.TIME_SHEET_FINALIZED,
        });
    } catch (error) {
        throw error;
    }
};

export const getInvoiceData: Controller = async (req, res) => {
    try {
        const { startDate } = req.body;
        const physicianId = req.user.id;

        // Checking if weekly timesheet record exists
        const existsInvoice = await WeeklyTimesheet.findOne({
            where: { physicianId, startDate },
        });

        // Handling case where weekly timesheet record does not exist
        if (!existsInvoice) {
            return res.status(httpCode.BAD_REQUEST).json({
                status: httpCode.BAD_REQUEST,
                message: messageConstant.INVALID_INPUT,
            });
        }

        // Retrieving timesheet details for the weekly timesheet record
        const getInvoiceData = await TimesheetDetail.findAndCountAll({
            attributes: [
                'id',
                'date',
                'numberOfShifts',
                'nightShiftWeekend',
                'houseCall',
                'houseCallNightWeekend',
                'phoneConsult',
                'phoneConsultNightWeekend',
                'batchTesting',
                'item',
                'amount',
                'bill',
            ],
            include: [
                {
                    model: WeeklyTimesheet,
                    attributes: ['id', 'isFinalize'],
                },
            ],
            where: {
                timesheetId: existsInvoice.id,
            },
        });

        // Sending response with the retrieved timesheet details
        return res.status(httpCode.OK).json({
            status: httpCode.OK,
            message: messageConstant.TIME_SHEET_RETRIEVED,
            data: getInvoiceData,
        });
    } catch (error) {
        throw error;
    }
};
