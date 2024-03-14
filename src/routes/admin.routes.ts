import {
    dashboardController,
    myProfileController,
    accessController,
    recordsController,
    providerController,
    schedulingController,
} from "../controllers/index";
import express from "express";
import isAuth from "../middleware/in-auth";
import { celebrate } from "celebrate";
import { RequestSchema, RoleSchema, UserSchema } from "../validations/index";

const router = express.Router();

router.get("/dashboard", dashboardController.requestCount);

router.get("/", isAuth, dashboardController.getPatientByState);

router.get(
    "/viewCase/:id",
    isAuth,
    celebrate(RequestSchema.idParams),
    dashboardController.viewCase
);

router.get(
    "/viewNotes/:id",
    isAuth,
    celebrate(RequestSchema.idParams),
    dashboardController.viewNotes
);

router.patch(
    "/updateNotes/:id",
    isAuth,
    celebrate(RequestSchema.updateNotes),
    dashboardController.updateNotes
);

router.get(
    "/patientName/:id",
    isAuth,
    celebrate(RequestSchema.idParams),
    dashboardController.getPatientName
);

router.patch(
    "/cancelCase/:id",
    isAuth,
    celebrate(RequestSchema.cancelCase),
    dashboardController.cancelCase
);

router.patch(
    "/blockCase/:id",
    isAuth,
    celebrate(RequestSchema.blockCase),
    dashboardController.blockCase
);

router.post(
    "/clearCase/:id",
    isAuth,
    celebrate(RequestSchema.idParams),
    dashboardController.clearCase
);

router.post(
    "/sendAgreement/:id",
    isAuth,
    celebrate(RequestSchema.idParams),
    dashboardController.sendAgreement
);

router.get("/regions", isAuth, dashboardController.getRegions);

router.get(
    "/physicianByRegion/:id",
    isAuth,
    celebrate(RequestSchema.idParams),
    dashboardController.getPhysicianByRegion
);

router.get("/viewUploads/:id", isAuth, dashboardController.viewUploads);

router.get("/closeCaseView/:id", isAuth, dashboardController.closeCaseView);

router.patch(
    "/closeCase/:id",
    isAuth,
    celebrate(RequestSchema.idParams),
    dashboardController.closeCase
);

router.post(
    "/editCloseCase/:id",
    isAuth,
    celebrate(RequestSchema.closeCase),
    dashboardController.editCloseCase
);

router.get(
    "/adminProfile/:id",
    isAuth,
    celebrate(RequestSchema.idParams),
    myProfileController.adminProfile
);

router.patch(
    "/editAdminProfile/:id",
    isAuth,
    myProfileController.editAdminProfile
);

router.post(
    "/assignCase",
    isAuth,
    celebrate(RequestSchema.assignCase),
    dashboardController.assignCase
);

router.post(
    "/requestSupport",
    isAuth,
    celebrate(UserSchema.requestSupport),
    dashboardController.requestSupport
);

router.get("/accountAccess", isAuth, accessController.accountAccess);

router.get(
    "/accountAccessByAccountType",
    isAuth,
    accessController.accountAccessByAccountType
);

router.post(
    "/createRole",
    isAuth,
    celebrate(RoleSchema.createRole),
    accessController.createRole
);

router.post("/assignCase/:id", isAuth, dashboardController.assignCase);

router.post(
    "/transferRequest/:id",
    isAuth,
    celebrate(RequestSchema.assignCase),
    dashboardController.transferRequest
);

router.post(
    "/sendPatientRequest",
    isAuth,
    celebrate(UserSchema.sendPatientRequest),
    dashboardController.sendPatientRequest
);

router.get("/patientHistory", isAuth, recordsController.getPatientHistory);

router.get("/blockHistory", isAuth, recordsController.blockHistory);

router.get(
    "/userAccess",
    isAuth,
    celebrate(RoleSchema.userAccess),
    accessController.userAccess
);

router.get(
    "/providerInformation",
    isAuth,
    providerController.providerInformation
);

router.get(
    "/physicianProfile/:id",
    isAuth,
    celebrate(RequestSchema.idParams),
    providerController.physicianProfileInAdmin
);

router.get("/providerOnCall", isAuth, schedulingController.providerOnCall);

export default router;
