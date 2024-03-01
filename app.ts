import express, {
    Application,
    NextFunction,
    Request,
    Response,
    json,
} from "express";
import router from "./src/routes/index";
import { dbConnection } from "./src/db/config/index";
import swaggerDoc from "./src/swagger/swagger";
import { errors } from "celebrate";
import dotenv from "dotenv";
dotenv.config();

const PORT = process.env.PORT;

const app = express();

app.use(json());

app.use(router);
app.get("/", (req: Request, res: Response) => {
    // throw new Error("Test11");
    res.send("Hello World!");
});
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
    console.log(">>>>Main Handler", error);
    return res.status(500).json({
        status: "httpCode.INTERNAL_SERVER_ERROR",
        message: "messageConstant.INTERNAL_SERVER_ERROR,",
        data: "error",
    });
});
dbConnection();

// app.use(errors());

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
swaggerDoc(app);
