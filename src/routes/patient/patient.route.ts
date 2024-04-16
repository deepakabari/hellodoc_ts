import express from 'express';
import isAuth from '../../middleware/in-auth';
import { patientDashboard } from '../../controllers';
import { celebrate } from 'celebrate';
import { PatientSchema } from '../../validations';

const router = express.Router();

router.patch('/acceptAgreement/:id', isAuth, patientDashboard.acceptAgreement);

router.patch('/cancelAgreement/:id', isAuth, patientDashboard.cancelAgreement);

router.get('/medicalHistory', isAuth, patientDashboard.medicalHistory);

router.put(
    '/editPatientProfile',
    isAuth,
    celebrate(PatientSchema.editPatientProfile),
    patientDashboard.editPatientProfile,
);

export default router;
