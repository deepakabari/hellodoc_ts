import httpCode from '../../../constants/http.constant';
import messageConstant from '../../../constants/message.constant';
import { Controller, ShiftWhereAttributes } from '../../../interfaces';
import dotenv from 'dotenv';
dotenv.config();
import { Shift, Request, User } from '../../../db/models/index';
import { Request as ExpressRequest, Response } from 'express';
import sequelize from 'sequelize';
import { Op } from 'sequelize';
import { compileEmailTemplate } from '../../../utils/hbsCompiler';
import pdf from 'html-pdf';

export const viewSchedule: Controller = async (req, res) => {
    try {
        // Extract the user ID from the request
        const id = req.user.id;

        // Extract the month from the query parameters
        const { month } = req.query;

        // Convert the month to a number if provided
        const monthNumber: number | undefined =
            typeof month === 'string' ? parseInt(month, 10) - 1 : undefined;

        // Define the where condition for filtering shifts
        let whereCondition: ShiftWhereAttributes = {
            isDeleted: false,
        };

        // If month is provided, filter by month
        if (monthNumber !== undefined) {
            // Filter by month if only the month is provided
            whereCondition[Op.and] = [
                sequelize.where(
                    sequelize.fn('MONTH', sequelize.col('shiftDate')),
                    monthNumber + 1,
                ),
            ];
        }

        // Retrieve the schedule of the physician from the database
        const viewSchedule = await Shift.findAll({
            attributes: [
                'id',
                'region',
                'shiftDate',
                'startTime',
                'endTime',
                'isApproved',
                'isRepeat',
                'sunday',
                'monday',
                'tuesday',
                'wednesday',
                'thursday',
                'friday',
                'saturday',
                'repeatUpto',
            ],
            where: {
                physicianId: id,
                ...whereCondition,
            },
        });

        // Send the shift details data in the response.
        return res.status(httpCode.OK).json({
            status: httpCode.OK,
            message: messageConstant.SHIFT_RETRIEVED,
            data: viewSchedule,
        });
    } catch (error) {
        throw error;
    }
};

export const invoices = async (req: ExpressRequest, res: Response) => {
    try {
        const { id } = req.params;

        // Check if the request exists
        const exists = await Request.findByPk(id);
        if (!exists) {
            return res.status(httpCode.BAD_REQUEST).json({
                status: httpCode.BAD_REQUEST,
                message: messageConstant.REQUEST_NOT_FOUND,
            });
        }

        // Retrieve the invoices of the request from the database
        const invoices = await Request.findAll({
            attributes: [
                'id',
                'patientFirstName',
                'patientLastName',
                'dob',
                'street',
                'city',
                'state',
                'zipCode',
                'patientEmail',
                'patientPhoneNumber',
            ],
            include: [
                {
                    model: User,
                    as: 'physician',
                    attributes: [
                        'id',
                        'firstName',
                        'lastName',
                        'address1',
                        'address2',
                        'city',
                        'state',
                        'zipCode',
                        'email',
                        'phoneNumber',
                    ],
                },
            ],
            where: {
                id,
            },
        });

        const html = await compileEmailTemplate('invoice', {
            invoiceData: invoices[0].dataValues,
        });

        const options: any = { format: 'Letter' };

        pdf.create(html, options).toBuffer((err, buffer) => {
            if(err) {
                console.error('Error creating invoice: ', err);
                return;
            }

            // Set response headers for PDF download
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader(
                'Content-Disposition',
                'attachment; filename=encounter_form.pdf',
            );

            // Send the PDF buffer as the response
            res.send(buffer);
        })
    } catch (error) {
        throw error;
    }
};
