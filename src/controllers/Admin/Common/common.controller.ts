import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import httpCode from '../../../constants/http.constant';
import messageConstant from '../../../constants/message.constant';
import { Controller } from '../../../interfaces';
import {
    Region,
    Request,
    RequestWiseFiles,
    User,
} from '../../../db/models/index';
import { Request as ExpressRequest, Response } from 'express';
import archiver from 'archiver';
const unlinkAsync = promisify(fs.unlink);
import ExcelJS from 'exceljs';
import json2xls from 'json2xls';

/**
 * @function getLoggedData
 * @param req - Express request object containing user input.
 * @param res - Express response object for sending the server's response.
 * @returns - A Promise that resolves when the operation is complete.
 * @description Retrieves logged user data based on the provided email.
 */
export const getLoggedData: Controller = async (req, res) => {
    try {
        // Extract the email from request body
        const { email } = req.params;

        // Retrieves the user details from user table
        const userDetails = await User.findAll({
            attributes: ['id', 'userName', 'accountType'],
            where: { email },
        });

        // if there is no userDetails then give not found message
        if (userDetails.length === 0) {
            return res.status(httpCode.BAD_REQUEST).json({
                status: httpCode.BAD_REQUEST,
                message: messageConstant.DATA_NOT_FOUND,
            });
        }

        // Return user details if found
        return res.status(httpCode.OK).json({
            status: httpCode.OK,
            message: messageConstant.SUCCESS,
            data: userDetails,
        });
    } catch (error) {
        throw error;
    }
};

export const downloadFile = async (req: ExpressRequest, res: Response) => {
    try {
        const { fileNames } = req.body;

        // Validate fileNames array
        if (!Array.isArray(fileNames) || fileNames.length === 0) {
            return res
                .status(httpCode.NOT_FOUND)
                .json({ error: messageConstant.INVALID_INPUT });
        }

        const archive = archiver('zip', {
            zlib: { level: 9 },
        });

        res.attachment('downloaded-files.zip');
        // const fileStream = fs.createWriteStream('downloaded-files.zip');
        archive.pipe(res);

        fileNames.forEach((fileName: string) => {
            const filePath = path.join(
                __dirname,
                '..',
                '..',
                '..',
                'public',
                'images',
                fileName,
            );

            if (fs.existsSync(filePath)) {
                archive.append(fs.createReadStream(filePath), {
                    name: fileName,
                });
            } else {
                console.warn(`${messageConstant.FILE_NOT_FOUND}: ${fileName}`);
            }
        });

        await archive.finalize();
    } catch (error) {
        throw error;
    }
};

export const deleteFile: Controller = async (req, res) => {
    try {
        const { id } = req.params;
        const { fileNames } = req.body;

        for (const fileName of fileNames) {
            const filePath = path.join(
                __dirname,
                '..',
                '..',
                '..',
                'public',
                'images',
                fileName,
            );

            const fileRecord = await RequestWiseFiles.findOne({
                where: { fileName, requestId: id },
            });

            if (!fileRecord || fileRecord === null) {
                return res.status(httpCode.NOT_FOUND).json({
                    status: httpCode.NOT_FOUND,
                    message: messageConstant.FILE_NOT_FOUND,
                });
            }

            await unlinkAsync(filePath);

            await fileRecord.destroy();
        }

        return res.status(httpCode.OK).json({
            status: httpCode.OK,
            message: messageConstant.FILE_DELETED,
        });
    } catch (error) {
        throw error;
    }
};

export const exportFile = async (req: ExpressRequest, res: Response) => {
    try {
        const { state } = req.params;
        let attributes = [
            ['requestType', 'Request Type'],
            ['patientFirstName', 'Patient First Name'],
            ['patientLastName', 'Patient Last Name'],
            ['patientPhoneNumber', 'Patient Phonenumber'],
            ['dob', 'Date of birth'],
            ['requestorFirstName', 'Requestor First Name'],
            ['requestorLastName', 'Requestor Last Name'],
            ['requestorPhoneNumber', 'Requestor phonenumber'],
            ['street', 'Street'],
            ['city', 'City'],
            ['state', 'State'],
            ['zipCode', 'Zip Code'],
            ['caseTag', 'State of Request'],
            ['patientNote', 'Patient Note'],
            ['transferNote', 'Transfer Note'],
            ['createdAt', 'Requested Date'],
            ['updatedAt', 'Date Of Service'],
        ];

        const patients = await Request.findAll({
            attributes: attributes.map((attr) => attr[0]),
            where: { caseTag: state },
        });

        const jsonPatients = patients.map((patient: any) => {
            const patientData: any = {};
            attributes.forEach((attr) => {
                if (typeof attr === 'string') {
                    patientData[attr] = patient[attr];
                } else {
                    patientData[attr[1]] = patient[attr[0]];
                }
            });
            return patientData;
        });

        const xls = json2xls(jsonPatients);

        const filename = `${state}_patients_${Date.now()}.xlsx`;
        fs.writeFileSync(filename, xls, 'binary');

        return res.download(filename, filename, () => {
            // Delete the file after download completes
            fs.unlinkSync(filename);
        });
    } catch (error) {
        throw error;
    }
};

export const exportAll = async (req: ExpressRequest, res: Response) => {
    try {
        let attributes = [
            ['requestType', 'Request Type'],
            ['patientFirstName', 'Patient First Name'],
            ['patientLastName', 'Patient Last Name'],
            ['patientPhoneNumber', 'Patient Phonenumber'],
            ['dob', 'Date of birth'],
            ['requestorFirstName', 'Requestor First Name'],
            ['requestorLastName', 'Requestor Last Name'],
            ['requestorPhoneNumber', 'Requestor phonenumber'],
            ['street', 'Street'],
            ['city', 'City'],
            ['state', 'State'],
            ['zipCode', 'Zip Code'],
            ['caseTag', 'State of Request'],
            ['patientNote', 'Patient Note'],
            ['transferNote', 'Transfer Note'],
            ['createdAt', 'Requested Date'],
            ['updatedAt', 'Date Of Service'],
        ];

        const patients = await Request.findAll({
            attributes: attributes.map((attr) => attr[0]),
        });

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('All Requests');

        const headers = attributes.map((attr) =>
            typeof attr === 'string' ? attr : attr[1],
        );
        worksheet.addRow(headers);

        patients.forEach((patient: any) => {
            const rowData = attributes.map((attr) => {
                if (typeof attr === 'string') {
                    return patient[attr];
                } else {
                    return patient[attr[0]];
                }
            });
            worksheet.addRow(rowData);
        });

        const filename = `all_patients_${Date.now()}.xlsx`;
        await workbook.xlsx.writeFile(filename);

        return res.download(filename, filename, () => {
            // Delete the file after download completes
            fs.unlinkSync(filename);
        });
    } catch (error) {
        throw error;
    }
};

export const verifyState: Controller = async (req, res) => {
    try {
        // Extract data from request body
        const { state } = req.body;

        const regionExists = await Region.findOne({ where: { name: state } });

        if (!regionExists) {
            return res
                .status(httpCode.NOT_FOUND)
                .json({ message: messageConstant.INVALID_REGION });
        }

        return res
            .status(httpCode.OK)
            .json({ message: messageConstant.VALID_REGION });
    } catch (error) {
        throw error;
    }
};
