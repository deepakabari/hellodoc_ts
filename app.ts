import express, { NextFunction, Request, Response } from "express";
import router from "./src/routes/index";
import { dbConnection } from "./src/db/config/index";
import swaggerDoc from "./src/swagger/swagger";
import multer from "multer";
import { fileStorage } from "./src/utils/multerConfig";
import path from "path";
import bodyParser from "body-parser";
import { errors } from "celebrate";
import { errorHandler } from "./src/utils/errorHandler";
import { engine } from "express-handlebars";
import dotenv from "dotenv";
dotenv.config();

const PORT = process.env.PORT;

const app = express();

app.engine("hbs", engine({ extname: "hbs", defaultLayout: false }));
app.set("view engine", "hbs");

app.use(multer({ storage: fileStorage }).single("document"));

app.use(
    "/images",
    express.static(path.join(__dirname, "src", "public", "images"))
);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use((req: Request, res: Response, next: NextFunction) => {
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
app.use(router);
app.use(errors());

app.get("/", (req: Request, res: Response) => {
    res.send("API is working...");
});

app.use(errorHandler);
dbConnection();

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
swaggerDoc(app);
