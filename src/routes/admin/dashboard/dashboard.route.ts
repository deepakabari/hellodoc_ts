import { dashboardController } from '../../../controllers/index';
import express from 'express';
import isAuth from '../../../middleware/in-auth';
import { celebrate } from 'celebrate';
import { RequestSchema, UserSchema } from '../../../validations/index';
import { upload } from '../../../utils/multerConfig';
import verifyRole from '../../../middleware/verifyRole';

const router = express.Router();

router.get(
    '/dashboard',
    isAuth,
    verifyRole(['Dashboard']),
    dashboardController.requestCount,
);

router.get(
    '/',
    isAuth,
    verifyRole(['Dashboard']),
    dashboardController.getPatientByState,
);

router.get(
    '/viewCase/:id',
    isAuth,
    verifyRole(['Dashboard']),
    celebrate(RequestSchema.idParams),
    dashboardController.viewCase,
);

router.get(
    '/viewNotes/:id',
    isAuth,
    verifyRole(['Dashboard']),
    celebrate(RequestSchema.idParams),
    dashboardController.viewNotes,
);

router.patch(
    '/updateNotes/:id',
    isAuth,
    verifyRole(['Dashboard']),
    celebrate(RequestSchema.updateNotes),
    dashboardController.updateNotes,
);

router.get(
    '/patientName/:id',
    isAuth,
    celebrate(RequestSchema.idParams),
    dashboardController.getPatientData,
);

router.patch(
    '/cancelCase/:id',
    isAuth,
    verifyRole(['Dashboard']),
    celebrate(RequestSchema.cancelCase),
    dashboardController.cancelCase,
);

router.patch(
    '/blockCase/:id',
    isAuth,
    verifyRole(['Dashboard']),
    celebrate(RequestSchema.blockCase),
    dashboardController.blockCase,
);

router.post(
    '/clearCase/:id',
    isAuth,
    verifyRole(['Dashboard']),
    celebrate(RequestSchema.idParams),
    dashboardController.clearCase,
);

router.get(
    '/viewSendAgreement/:id',
    isAuth,
    verifyRole(['Dashboard']),
    dashboardController.viewSendAgreement,
);

router.post(
    '/sendAgreement/:id',
    isAuth,
    verifyRole(['Dashboard']),
    celebrate(RequestSchema.idParams),
    dashboardController.sendAgreement,
);

router.get(
    '/regions',
    isAuth,
    verifyRole(['Dashboard']),
    dashboardController.getRegions,
);

router.get(
    '/physicianByRegion/:id',
    isAuth,
    verifyRole(['Dashboard']),
    celebrate(RequestSchema.idParams),
    dashboardController.getPhysicianByRegion,
);

router.post(
    '/assignCase/:id',
    isAuth,
    verifyRole(['Dashboard']),
    celebrate(RequestSchema.assignCase),
    dashboardController.assignCase,
);

router.post(
    '/requestSupport',
    isAuth,
    verifyRole(['Dashboard']),
    celebrate(UserSchema.requestSupport),
    dashboardController.requestSupport,
);

router.get(
    '/viewUploads/:id',
    isAuth,
    dashboardController.viewUploads,
);

router.post(
    '/uploadFile/:id',
    upload.single('document'),
    isAuth,
    verifyRole(['Dashboard']),
    dashboardController.uploadFile,
);

router.get(
    '/closeCaseView/:id',
    isAuth,
    verifyRole(['Dashboard']),
    dashboardController.closeCaseView,
);

router.patch(
    '/closeCase/:id',
    isAuth,
    verifyRole(['Dashboard']),
    celebrate(RequestSchema.idParams),
    dashboardController.closeCase,
);

router.patch(
    '/updateCloseCase/:id',
    isAuth,
    verifyRole(['Dashboard']),
    dashboardController.updateCloseCase,
);

router.post(
    '/transferRequest/:id',
    isAuth,
    verifyRole(['Dashboard']),
    celebrate(RequestSchema.assignCase),
    dashboardController.transferRequest,
);

router.post(
    '/sendPatientRequest',
    isAuth,
    verifyRole(['Dashboard']),
    celebrate(UserSchema.sendPatientRequest),
    dashboardController.sendPatientRequest,
);

router.post(
    '/sendFilesByEmail',
    isAuth,
    verifyRole(['Dashboard']),
    dashboardController.sendFileThroughMail,
);
export default router;
