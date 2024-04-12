import express from 'express';
import isAuth from '../../../middleware/in-auth';
import { providerDashboard } from '../../../controllers';

const router = express.Router();

router.get('/', isAuth, providerDashboard.getPatientByState);

router.get('/dashboardCount', isAuth, providerDashboard.requestCount);

router.patch('/acceptRequest/:id', isAuth, providerDashboard.acceptRequest);

export default router;
