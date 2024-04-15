import express from 'express';
import isAuth from '../../../middleware/in-auth';
import { providerDashboard } from '../../../controllers';

const router = express.Router();

router.get('/', isAuth, providerDashboard.getPatientByState);

router.get('/dashboardCount', isAuth, providerDashboard.requestCount);

router.patch('/acceptRequest/:id', isAuth, providerDashboard.acceptRequest);

router.patch('/concludeCare/:id', isAuth, providerDashboard.concludeCare);

router.patch('/typeOfCare/:id', isAuth, providerDashboard.typeOfCare);

router.patch('/transferRequest/:id', isAuth, providerDashboard.transferRequest);

export default router;
