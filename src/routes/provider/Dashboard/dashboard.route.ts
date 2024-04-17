import express from 'express';
import isAuth from '../../../middleware/in-auth';
import { providerDashboard } from '../../../controllers';
import { celebrate } from 'celebrate';
import { ProviderSchema } from '../../../validations';

const router = express.Router();

router.get('/', isAuth, providerDashboard.getPatientByState);

router.get('/dashboardCount', isAuth, providerDashboard.requestCount);

router.patch('/acceptRequest/:id', isAuth, providerDashboard.acceptRequest);

router.patch(
    '/updateNotes/:id',
    isAuth,
    celebrate(ProviderSchema.updateNotes),
    providerDashboard.updateNotes,
);

router.patch(
    '/concludeCare/:id',
    isAuth,
    celebrate(ProviderSchema.concludeCare),
    providerDashboard.concludeCare,
);

router.patch(
    '/typeOfCare/:id',
    isAuth,
    celebrate(ProviderSchema.typeOfCare),
    providerDashboard.typeOfCare,
);

router.patch('/houseCallType/:id', isAuth, providerDashboard.houseCallType);

router.patch(
    '/transferRequest/:id',
    isAuth,
    celebrate(ProviderSchema.transferRequest),
    providerDashboard.transferRequest,
);

router.post(
    '/encounterForm/:id',
    isAuth,
    celebrate(ProviderSchema.encounterForm),
    providerDashboard.encounterForm,
);

router.patch('/finalizeForm/:id', isAuth, providerDashboard.finalizeForm);

router.get(
    '/viewEncounterForm/:id',
    isAuth,
    providerDashboard.viewEncounterForm,
);

router.patch(
    '/editEncounterForm/:id',
    isAuth,
    celebrate(ProviderSchema.encounterForm),
    providerDashboard.editEncounterForm,
);

router.get('/download/:id', providerDashboard.downloadEncounter);

export default router;
