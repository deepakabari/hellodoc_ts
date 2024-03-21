import { recordsController } from '../../../controllers/index';
import express from 'express';
import isAuth from '../../../middleware/in-auth';
import { RecordSchema } from '../../../validations';
import { celebrate } from 'celebrate';

const router = express.Router();

router.get('/patientHistory', isAuth, recordsController.getPatientHistory);

router.get('/blockHistory', isAuth, recordsController.blockHistory);

router.get('/patientRecord', isAuth, recordsController.patientRecord);

router.get(
    '/searchRecord',
    isAuth,
    celebrate(RecordSchema.searchRecord),
    recordsController.searchRecord,
);

export default router;
