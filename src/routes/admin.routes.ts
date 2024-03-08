import * as adminController from "../controllers/admin.controller";
import express from "express";

const router = express.Router();

router.get("/", adminController.getPatientByState);

router.get("/viewCase/:id", adminController.viewCase);

router.get("/viewNotes/:id", adminController.viewNotes);

router.patch("/cancelCase/:id", adminController.cancelCase);

router.patch("/blockCase/:id", adminController.blockCase);

router.post("/clearCase/:id", adminController.clearCase);

router.post("/sendAgreement/:id", adminController.sendAgreement);

router.get("/regions", adminController.getRegions);

router.get("/viewUploads/:id", adminController.viewUploads);

router.get("/closeCase/:id", adminController.closeCase);

router.post("/editCloseCase/:id", adminController.editCloseCase);

router.get("/adminProfile", adminController.adminProfile);

router.get("/physicianByRegion/:id", adminController.getPhysicianByRegion);

router.post("/assignCase", adminController.assignCase);

router.get("/requestSupport", adminController.requestSupport);

router.get("/accountAccess", adminController.accountAccess);

router.get("/accountAccessByAccountType", adminController.accountAccessByAccountType);

router.post("/createRole", adminController.createRole);

router.post("/assignCase/:id", adminController.assignCase);

router.post("/transferRequest/:id", adminController.transferRequest);

router.post("/sendPatientRequest", adminController.sendPatientRequest);

router.get("/patientHistory", adminController.getPatientHistory);

router.get("/blockHistory", adminController.blockHistory)

export default router;
