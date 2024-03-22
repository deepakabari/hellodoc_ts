import httpCode from '../../../constants/http.constant';
import messageConstant from '../../../constants/message.constant';
import { Controller } from '../../../interfaces';

console.log(__dirname);
export const downloadFile: Controller = async (req, res) => {
    try {
        const { file } = req.body;
        const filePath = `${__dirname}/files`;

        // download(file, filePath).then(() => {
        //     console.log('Download Completed');
        // });

        return res.status(httpCode.OK).json({
            status: httpCode.OK,
            message: messageConstant.SUCCESS,
        });
    } catch (error) {
        throw error;
    }
};
