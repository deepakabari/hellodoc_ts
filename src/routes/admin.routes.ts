import * as adminController from "../controllers/admin.controller";
import express from "express";
import isAuth from "../middleware/in-auth";

const router = express.Router();

router.get("/", isAuth, adminController.getPatientByState);

router.get("/viewCase/:id", isAuth, adminController.viewCase);

router.get("/viewNotes/:id", isAuth, adminController.viewNotes);

router.patch("/updateNotes/:id", adminController.updateNotes);

router.patch("/cancelCase/:id", isAuth, adminController.cancelCase);

router.patch("/blockCase/:id", isAuth, adminController.blockCase);

router.post("/clearCase/:id", isAuth, adminController.clearCase);

router.post("/sendAgreement/:id", isAuth, adminController.sendAgreement);

router.get("/regions", isAuth, adminController.getRegions);

router.get("/viewUploads/:id", isAuth, adminController.viewUploads);

router.get("/closeCaseView/:id", isAuth, adminController.closeCaseView);

router.patch("/closeCase/:id", isAuth, adminController.closeCase);

router.post("/editCloseCase/:id", isAuth, adminController.editCloseCase);

router.get("/adminProfile", isAuth, adminController.adminProfile);

router.patch("/editAdminProfile/:id", isAuth, adminController.editAdminProfile);

router.get(
    "/physicianByRegion/:id",
    isAuth,
    adminController.getPhysicianByRegion
);

router.post("/assignCase", isAuth, adminController.assignCase);

router.get("/requestSupport", isAuth, adminController.requestSupport);

router.get("/accountAccess", isAuth, adminController.accountAccess);

router.get(
    "/accountAccessByAccountType",
    isAuth,
    adminController.accountAccessByAccountType
);

router.post("/createRole", isAuth, adminController.createRole);

router.post("/assignCase/:id", isAuth, adminController.assignCase);

router.post("/transferRequest/:id", isAuth, adminController.transferRequest);

router.post("/sendPatientRequest", isAuth, adminController.sendPatientRequest);

router.get("/patientHistory", isAuth, adminController.getPatientHistory);

router.get("/blockHistory", isAuth, adminController.blockHistory);

router.get("/userAccess", adminController.userAccess);

router.get("/providerInformation", adminController.providerInformation);

router.get("/physicianProfile/:id", adminController.physicianProfileInAdmin);

export default router;
