import {
    recordsController,
} from "../../../controllers/index";
import express from "express";
import isAuth from "../../../middleware/in-auth";
import { celebrate } from "celebrate";
import { RequestSchema, RoleSchema, UserSchema } from "../../../validations/index";

const router = express.Router();

router.get("/patientHistory", isAuth, recordsController.getPatientHistory);

router.get("/blockHistory", isAuth, recordsController.blockHistory);


export default router;
