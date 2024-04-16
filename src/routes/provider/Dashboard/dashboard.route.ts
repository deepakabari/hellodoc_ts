import express from 'express';
import isAuth from '../../../middleware/in-auth';
import { providerDashboard } from '../../../controllers';

const router = express.Router();

router.get('/', isAuth, providerDashboard.getPatientByState);

router.get('/dashboardCount', isAuth, providerDashboard.requestCount);

router.patch('/acceptRequest/:id', isAuth, providerDashboard.acceptRequest);

router.patch('/concludeCare/:id', isAuth, providerDashboard.concludeCare);

router.patch('/typeOfCare/:id', isAuth, providerDashboard.typeOfCare);

router.patch('/houseCallType/:id', isAuth, providerDashboard.houseCallType);

router.patch('/transferRequest/:id', isAuth, providerDashboard.transferRequest);

router.post('/encounterForm/:id', isAuth, providerDashboard.encounterForm);

router.patch('/finalizeForm/:id', isAuth, providerDashboard.finalizeForm);

router.get(
    '/viewEncounterForm/:id',
    isAuth,
    providerDashboard.viewEncounterForm,
);

router.patch(
    '/editEncounterForm/:id',
    isAuth,
    providerDashboard.editEncounterForm,
);

router.get('/download/:id', providerDashboard.downloadEncounter);

export default router;
