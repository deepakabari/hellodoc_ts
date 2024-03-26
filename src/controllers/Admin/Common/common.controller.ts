import fs from 'fs';
import path from 'path';
import httpCode from '../../../constants/http.constant';
import messageConstant from '../../../constants/message.constant';
import { Controller } from '../../../interfaces';
import zlib from 'zlib';
import { User } from '../../../db/models/index';

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
        const { email } = req.body;

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

export const downloadFile: Controller = async (req, res) => {
    try {
        // const { file } = req.body;
        const filePath = path.join(
            __dirname,
            '..',
            '..',
            '..',
            'public',
            'images',
        );

        const files = [
            { path: 'file1.txt', name: 'my-file-1.txt' },
            { path: 'file2.jpg', name: 'my-image.jpg' },
            // Add more files as needed
        ];

        const zipStream = zlib.createGzip();
        res.set('Content-Type', 'application/zip');
        res.set('Content-Disposition', 'attachment; filename=my-files.zip');
        zipStream.pipe(res);

        // Add each file to the zip archive
        files.forEach((file) => {
            const readStream = fs.createReadStream(file.path);
            zipStream.write(`${file.name}\n`);
            readStream.pipe(zipStream, { end: false });
        });

        // End the zip stream
        zipStream.end(() => {
            console.log('Download completed!');
        });

        return res.status(httpCode.OK).json({
            status: httpCode.OK,
            message: messageConstant.SUCCESS,
        });
    } catch (error) {
        throw error;
    }
};
