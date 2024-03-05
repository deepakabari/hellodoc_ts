import multer, { StorageEngine } from "multer";

export const fileStorage: StorageEngine = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./src/public/images");
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    },
});
