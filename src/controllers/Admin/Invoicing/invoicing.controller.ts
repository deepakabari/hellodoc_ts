import httpCode from '../../../constants/http.constant';
import messageConstant from '../../../constants/message.constant';
import { Controller } from '../../../interfaces';
import { PayRate } from '../../../db/models/index';

export const getPayRate: Controller = async (req, res) => {
    try {
        const { id } = req.params;

        const existsPayRate = await PayRate.findByPk(id);
        if (!existsPayRate) {
            return res.status(httpCode.BAD_REQUEST).json({
                status: httpCode.BAD_REQUEST,
                message: messageConstant.PAYRATE_NOT_FOUND,
            });
        }

        const getPayRate = await PayRate.findAll({
            where: { id },
        });

        return res.status(httpCode.OK).json({
            status: httpCode.OK,
            message: messageConstant.PAYRATE_RETRIEVED,
            data: getPayRate,
        });
    } catch (error) {
        throw error;
    }
};

export const addPayRate: Controller = async (req, res) => {
    try {
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

        const existsPayRate = await PayRate.findOne({
            where: { physicianId },
        });
        if (existsPayRate) {
            return res.status(httpCode.BAD_REQUEST).json({
                status: httpCode.BAD_REQUEST,
                message: messageConstant.PAYRATE_ALREADY_EXISTS,
            });
        }

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

        if (!addPayRate) {
            return res.status(httpCode.BAD_REQUEST).json({
                status: httpCode.BAD_REQUEST,
                message: messageConstant.PAYRATE_CREATION_FAILED,
            });
        }

        // Send the newly created shift data in the response.
        return res.status(httpCode.OK).json({
            status: httpCode.OK,
            message: messageConstant.PAYRATE_CREATED,
            data: addPayRate,
        });
    } catch (error) {
        throw error;
    }
};

export const editPayrate: Controller = async (req, res) => {
    try {
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

        const existsPayRate = await PayRate.findOne({
            where: { physicianId },
        });
        if (!existsPayRate) {
            return res.status(httpCode.BAD_REQUEST).json({
                status: httpCode.BAD_REQUEST,
                message: messageConstant.PAYRATE_NOT_FOUND,
            });
        }

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

        return res.status(httpCode.OK).json({
            status: httpCode.OK,
            message: messageConstant.PAYRATE_EDITED,
        });
    } catch (error) {
        throw error;
    }
};
