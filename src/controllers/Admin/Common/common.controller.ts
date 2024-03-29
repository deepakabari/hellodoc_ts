import * as fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import httpCode from '../../../constants/http.constant';
import messageConstant from '../../../constants/message.constant';
import { Controller } from '../../../interfaces';
import { RequestWiseFiles, User } from '../../../db/models/index';
import { Request, Response } from 'express';
import archiver from 'archiver';
const unlinkAsync = promisify(fs.unlink);

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

export const downloadFile = async (req: Request, res: Response) => {
    try {
        const { fileNames } = req.body;
        const zip = archiver('zip', { zlib: { level: 5 } });

        // Check if all files exist
        const allFilesExist = fileNames.every((fileName: string) => {
            const filePath = path.join(
                __dirname,
                '..',
                '..',
                '..',
                'public',
                'images',
                fileName,
            );
            return fs.existsSync(filePath);
        });

        if (allFilesExist) {
            res.attachment('downloaded-files.zip');
            zip.pipe(res);

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
                zip.file(filePath, { name: fileName });
            });

            zip.finalize();
        } else {
            console.error(
                'One or more files were not found, aborting zip operation.',
            );
            res.status(500).json({
                message: messageConstant.FILE_NOT_FOUND,
            });
        }
    } catch (error) {
        throw error;
    }
};

export const deleteFile = async (req: Request, res: Response) => {
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
