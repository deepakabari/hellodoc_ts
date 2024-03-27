import {
    dashboardController,
} from '../../../controllers/index';
import express from 'express';
import isAuth from '../../../middleware/in-auth';
import { celebrate } from 'celebrate';
import { RequestSchema, UserSchema } from '../../../validations/index';
import { upload } from '../../../utils/multerConfig';

const router = express.Router();

router.get('/dashboard', isAuth, dashboardController.requestCount);

router.get('/', isAuth, dashboardController.getPatientByState);

router.get(
    '/viewCase/:id',
    isAuth,
    celebrate(RequestSchema.idParams),
    dashboardController.viewCase,
);

router.get(
    '/viewNotes/:id',
    isAuth,
    celebrate(RequestSchema.idParams),
    dashboardController.viewNotes,
);

router.patch(
    '/updateNotes/:id',
    isAuth,
    celebrate(RequestSchema.updateNotes),
    dashboardController.updateNotes,
);

router.get(
    '/patientName/:id',
    isAuth,
    celebrate(RequestSchema.idParams),
    dashboardController.getPatientName,
);

router.patch(
    '/cancelCase/:id',
    isAuth,
    celebrate(RequestSchema.cancelCase),
    dashboardController.cancelCase,
);

router.patch(
    '/blockCase/:id',
    isAuth,
    celebrate(RequestSchema.blockCase),
    dashboardController.blockCase,
);

router.post(
    '/clearCase/:id',
    isAuth,
    celebrate(RequestSchema.idParams),
    dashboardController.clearCase,
);

router.get(
    '/viewSendAgreement/:id',
    isAuth,
    dashboardController.viewSendAgreement,
);

router.post(
    '/sendAgreement/:id',
    isAuth,
    celebrate(RequestSchema.idParams),
    dashboardController.sendAgreement,
);

router.get('/regions', isAuth, dashboardController.getRegions);

router.get(
    '/physicianByRegion/:id',
    isAuth,
    celebrate(RequestSchema.idParams),
    dashboardController.getPhysicianByRegion,
);

router.post(
    '/assignCase/:id',
    isAuth,
    celebrate(RequestSchema.assignCase),
    dashboardController.assignCase,
);

router.post(
    '/requestSupport',
    isAuth,
    celebrate(UserSchema.requestSupport),
    dashboardController.requestSupport,
);

router.get('/viewUploads/:id', isAuth, dashboardController.viewUploads);

router.post(
    '/uploadFile/:id',
    upload.single('document'),
    isAuth,
    dashboardController.uploadFile,
);

router.get('/closeCaseView/:id', isAuth, dashboardController.closeCaseView);

router.patch(
    '/closeCase/:id',
    isAuth,
    celebrate(RequestSchema.idParams),
    dashboardController.closeCase,
);

router.patch(
    '/updateCloseCase/:id',
    isAuth,
    dashboardController.updateCloseCase,
);

router.post(
    '/editCloseCase/:id',
    isAuth,
    celebrate(RequestSchema.closeCase),
    dashboardController.editCloseCase,
);

router.post(
    '/transferRequest/:id',
    isAuth,
    celebrate(RequestSchema.assignCase),
    dashboardController.transferRequest,
);

router.post(
    '/sendPatientRequest',
    isAuth,
    celebrate(UserSchema.sendPatientRequest),
    dashboardController.sendPatientRequest,
);
export default router;
