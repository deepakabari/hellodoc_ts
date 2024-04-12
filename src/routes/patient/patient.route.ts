import express from 'express';
import isAuth from '../../middleware/in-auth';
import { patientDashboard } from '../../controllers';

const router = express.Router();

router.patch('/acceptAgreement/:id', isAuth, patientDashboard.acceptAgreement);

router.patch('/cancelAgreement/:id', isAuth, patientDashboard.cancelAgreement);

export default router;
