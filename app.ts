import express, { Application, Request, Response, json } from "express";
import router from "./src/routes/index";
import { dbConnection } from "./src/db/config/db.connection";
import swaggerDoc from "./src/swagger/swagger";
import { errors } from "celebrate";
import dotenv from "dotenv";
dotenv.config();

const PORT = process.env.PORT;

const app: Application = express();

app.use(json());

app.use(router);

dbConnection();

app.get("/", (req: Request, res: Response) => {
    res.send("Hello World!");
});
app.use(errors());

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
swaggerDoc(app);
