import express, { Request, Response } from "express";
import router from "./src/routes/index";
import { dbConnection } from "./src/db/config/index";
import swaggerDoc from "./src/swagger/swagger";
import multer from "multer";
import { fileStorage } from "./src/utils/multerConfig";
import path from "path";
import bodyParser from "body-parser";
import { errorHandler } from "./src/utils/errorHandler";
import dotenv from "dotenv";
dotenv.config();

const PORT = process.env.PORT;

const app = express();

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, PATCH, DELETE, OPTIONS"
    );
    res.setHeader(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization"
    );
    next();
});

app.use(multer({ storage: fileStorage }).single("documentPhoto"));

app.use(
    "/images",
    express.static(path.join(__dirname, "src", "public", "images"))
);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(router);

app.get("/", (req: Request, res: Response) => {
    res.send("Hello World!");
});

app.use(errorHandler);
dbConnection();

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
swaggerDoc(app);
