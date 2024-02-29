import * as adminController from "../controllers/admin.controller";
import express from "express";

const router = express.Router();

router.get("/new", adminController.getNewPatient);

export default router;