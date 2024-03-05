import * as adminController from "../controllers/admin.controller";
import express from "express";

const router = express.Router();

router.get("/state", adminController.getPatientByState);

router.get("/viewCase/:id", adminController.viewCase);

router.get("/viewNotes/:id", adminController.viewNotes);

router.post("/cancelCase/:id", adminController.cancelCase);

router.post("/blockCase/:id", adminController.blockCase);

router.post("/sendAgreement/:id", adminController.sendAgreement);

router.get("/regions", adminController.getRegions);

router.get("/viewUploads/:id", adminController.viewUploads);

router.get("/closeCase/:id", adminController.closeCase);

router.post("/editCloseCase/:id", adminController.editCloseCase);

router.get("/adminProfile", adminController.adminProfile);

export default router;
