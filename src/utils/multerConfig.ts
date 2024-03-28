import multer, { StorageEngine } from 'multer';
import { Request } from 'express';

export const fileStorage: StorageEngine = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './src/public/images');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + " " + file.originalname);
    },
});

export const fileFilter = (req: Request, file: any, cb: any) => {
    if (
        file.mimetype === 'image/png' ||
        file.mimetype === 'image/jpg' ||
        file.mimetype === 'image/jpeg' ||
        file.mimetype === 'application/pdf'
    ) {
        cb(null, true);
    } else {
        cb(null, false);
    }
};

export const upload = multer({ storage: fileStorage, fileFilter: fileFilter });
