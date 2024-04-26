import { recordsController } from '../../../controllers/index';
import express from 'express';
import isAuth from '../../../middleware/in-auth';
import { RecordSchema } from '../../../validations';
import { celebrate } from 'celebrate';
import verifyRole from '../../../middleware/verifyRole';

const router = express.Router();

router.get(
    '/patientHistory',
    isAuth,
    verifyRole(['History']),
    recordsController.getPatientHistory,
);

router.get(
    '/blockHistory',
    isAuth,
    verifyRole(['History', 'BlockHistory']),
    recordsController.blockHistory,
);

router.get(
    '/patientRecord/:id',
    isAuth,
    verifyRole(['History', 'PatientRecords']),
    recordsController.patientRecord,
);

router.get(
    '/searchRecord',
    isAuth,
    verifyRole(['History']),
    celebrate(RecordSchema.searchRecord),
    recordsController.searchRecord,
);

router.patch(
    '/unBlockPatient/:id',
    isAuth,
    verifyRole(['History', 'BlockHistory']),
    recordsController.unBlockPatient,
);

router.delete(
    '/deleteRecord/:id',
    isAuth,
    verifyRole(['History']),
    recordsController.deleteRecord,
);

router.get(
    '/exportToExcel',
    isAuth,
    verifyRole(['History']),
    recordsController.exportToExcel,
);

router.get(
    '/emailLog',
    isAuth,
    verifyRole(['History', 'EmailLogs']),
    recordsController.emailLog,
);

router.get(
    '/smsLog',
    isAuth,
    verifyRole(['History', 'SMSLogs']),
    recordsController.smsLog,
);

export default router;
