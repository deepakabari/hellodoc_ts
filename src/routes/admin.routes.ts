import * as adminController from "../controllers/admin.controller";
import express from "express";
import isAuth from "../middleware/in-auth";
import { celebrate } from "celebrate";
import { RequestSchema, RoleSchema, UserSchema } from "../db/models";

const router = express.Router();

router.get("/", isAuth, adminController.getPatientByState);

router.get("/viewCase/:id", isAuth, celebrate(RequestSchema.idParams), adminController.viewCase);

router.get("/viewNotes/:id", isAuth, celebrate(RequestSchema.idParams), adminController.viewNotes);

router.patch("/updateNotes/:id", isAuth, celebrate(RequestSchema.updateNotes), adminController.updateNotes);

router.get("/cancelCase/:id", isAuth, celebrate(RequestSchema.idParams), adminController.getPatientName)

router.patch("/cancelCase/:id", isAuth, celebrate(RequestSchema.cancelCase), adminController.cancelCase);

router.patch("/blockCase/:id", isAuth, celebrate(RequestSchema.blockCase), adminController.blockCase);

router.post("/clearCase/:id", isAuth, celebrate(RequestSchema.idParams), adminController.clearCase);

router.post("/sendAgreement/:id", isAuth, celebrate(RequestSchema.idParams), adminController.sendAgreement);

router.get("/regions", isAuth, adminController.getRegions);

router.get(
    "/physicianByRegion/:id",
    isAuth, celebrate(RequestSchema.idParams),
    adminController.getPhysicianByRegion
);

router.get("/viewUploads/:id", isAuth, adminController.viewUploads);

router.get("/closeCaseView/:id", isAuth, adminController.closeCaseView);

router.patch("/closeCase/:id", isAuth, celebrate(RequestSchema.idParams), adminController.closeCase);

router.post("/editCloseCase/:id", isAuth, celebrate(RequestSchema.closeCase), adminController.editCloseCase);

router.get("/adminProfile/:id", isAuth, celebrate(RequestSchema.idParams), adminController.adminProfile);

router.patch("/editAdminProfile/:id", isAuth, adminController.editAdminProfile);

router.post("/assignCase", isAuth, celebrate(RequestSchema.assignCase), adminController.assignCase);

router.get("/requestSupport", isAuth, adminController.requestSupport);

router.get("/accountAccess", isAuth, adminController.accountAccess);

router.get(
    "/accountAccessByAccountType",
    isAuth,
    adminController.accountAccessByAccountType
);

router.post("/createRole", isAuth, celebrate(RoleSchema.createRole), adminController.createRole);

router.post("/assignCase/:id", isAuth, adminController.assignCase);

router.post("/transferRequest/:id", isAuth, celebrate(RequestSchema.assignCase), adminController.transferRequest);

router.post("/sendPatientRequest", isAuth, celebrate(UserSchema.sendPatientRequest), adminController.sendPatientRequest);

router.get("/patientHistory", isAuth, adminController.getPatientHistory);

router.get("/blockHistory", isAuth, adminController.blockHistory);

router.get("/userAccess", isAuth, celebrate(RoleSchema.userAccess), adminController.userAccess);

router.get("/providerInformation", isAuth, adminController.providerInformation);

router.get("/physicianProfile/:id", isAuth, celebrate(RequestSchema.idParams), adminController.physicianProfileInAdmin);

export default router;
