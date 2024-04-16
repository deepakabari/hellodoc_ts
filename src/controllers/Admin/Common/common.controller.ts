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
    Role,
    User,
} from '../../../db/models/index';
import { Request as ExpressRequest, Response } from 'express';
import archiver from 'archiver';
const unlinkAsync = promisify(fs.unlink);
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

export const viewFile = async (req: ExpressRequest, res: Response) => {
    try {
        // Extract file name from request parameters
        const { fileName } = req.params;

        // Construct file path
        const filePath = path.join(
            __dirname,
            '..',
            '..',
            '..',
            'public',
            'images',
            fileName,
        );

        // Check if the file exists
        if (!fs.existsSync(filePath)) {
            // If file doesn't exist, return bad request response
            return res.status(httpCode.BAD_REQUEST).json({
                status: httpCode.BAD_REQUEST,
                message: messageConstant.FILE_NOT_FOUND,
            });
        } else {
            // If file exists, set response content type based on file extension
            res.type(path.extname(filePath));

            // Stream the file to the response
            fs.createReadStream(filePath).pipe(res);
        }
    } catch (error) {
        throw error;
    }
};

export const downloadFile = async (req: ExpressRequest, res: Response) => {
    try {
        // Extract file name from request parameters
        const { fileNames } = req.body;

        // Validate fileNames array
        if (!Array.isArray(fileNames) || !fileNames.length) {
            return res
                .status(httpCode.BAD_REQUEST)
                .json({ error: messageConstant.NO_FILE_SELECTED });
        }

        // Create a zip archive
        const archive = archiver('zip', {
            zlib: { level: 9 },
        });

        // Set response attachment as downloaded-files.zip
        res.attachment('downloaded-files.zip');

        // Pipe the archive to the response
        archive.pipe(res);

        // Iterate through each file name
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

            if (fs.existsSync(filePath)) {
                // Append file to the archive
                archive.append(fs.createReadStream(filePath), {
                    name: fileName,
                });
            } else {
                return res.status(httpCode.BAD_REQUEST).json({
                    status: httpCode.BAD_REQUEST,
                    message: messageConstant.FILE_NOT_FOUND,
                });
            }
        }

        // Finalize the archive
        await archive.finalize();
    } catch (error) {
        throw error;
    }
};

export const deleteFile: Controller = async (req, res) => {
    try {
          // Extract request parameters
        const { id } = req.params;
        const { fileNames } = req.body;

        // Validate fileNames array
        if (!Array.isArray(fileNames) || !fileNames.length) {
            return res
                .status(httpCode.BAD_REQUEST)
                .json({ error: messageConstant.NO_FILE_SELECTED });
        }

        // Iterate through each file name
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

            // Find the file record in the database
            const fileRecord = await RequestWiseFiles.findOne({
                where: { fileName, requestId: id },
            });

            // If file record doesn't exist, return bad request response
            if (!fileRecord) {
                return res.status(httpCode.BAD_REQUEST).json({
                    status: httpCode.BAD_REQUEST,
                    message: messageConstant.FILE_NOT_FOUND,
                });
            }

            // Delete the file from the file system
            await unlinkAsync(filePath);

             // Destroy the file record from the database
            await fileRecord.destroy();
        }

        // Return success response
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
        // Extract state from request parameters
        const { state } = req.params;

        // Define attributes for exporting
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

        // Fetch patients based on state and selected attributes
        const patients = await Request.findAll({
            attributes: attributes.map((attr) => attr[0]),
            where: { caseTag: state },
        });

        // Convert patient data to JSON format
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

        // Convert patient data to XLSX format
        const xls = json2xls(jsonPatients);

        // Generate filename with timestamp
        const filename = `${state}_patients_${Date.now()}.xlsx`;

        // Write XLSX data to file
        fs.writeFileSync(filename, xls, 'binary');

        // Send the file as a response and delete it afterwards
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
         // Define attributes for exporting
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

        // Fetch all patients with selected attributes
        const patients = await Request.findAll({
            attributes: attributes.map((attr) => attr[0]),
        });

        // Convert patient data to JSON format
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

        // Convert patient data to XLSX format
        const xls = json2xls(jsonPatients);

        // Generate filename with timestamp
        const filename = `all_patients_${Date.now()}.xlsx`;
        fs.writeFileSync(filename, xls, 'binary');

        // Send the file as a response and delete it afterwards
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

        // Check if region exists in the database
        const regionExists = await Region.findOne({ where: { name: state } });

        // Return response based on region existence
        if (!regionExists) {
            return res
                .status(httpCode.BAD_REQUEST)
                .json({ message: messageConstant.INVALID_REGION });
        }

        return res
            .status(httpCode.OK)
            .json({ message: messageConstant.VALID_REGION });
    } catch (error) {
        throw error;
    }
};

export const getRoles: Controller = async (req, res) => {
    try {
        // Extract accountType from query parameters
        const { accountType } = req.query;

        // Define where clause based on accountType
        let whereClause = {};
        if (accountType && accountType !== 'All') {
            whereClause = { accountType: accountType as string };
        }

        // Fetch roles based on where clause
        const getRoles = await Role.findAll({
            attributes: ['id', 'Name', 'accountType'],
            where: whereClause,
        });

        return res.status(httpCode.OK).json({
            status: httpCode.OK,
            message: messageConstant.ROLE_RETRIEVED,
            data: getRoles,
        });
    } catch (error) {
        throw error;
    }
};
