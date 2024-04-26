import express from 'express';
import isAuth from '../../../middleware/in-auth';
import { providerDashboard } from '../../../controllers';
import { celebrate } from 'celebrate';
import { ProviderSchema } from '../../../validations';
import verifyRole from '../../../middleware/verifyRole';

const router = express.Router();

router.get(
    '/',
    isAuth,
    verifyRole(['Dashboard']),
    providerDashboard.getPatientByState,
);

router.get(
    '/dashboardCount',
    isAuth,
    verifyRole(['Dashboard']),
    providerDashboard.requestCount,
);

router.patch(
    '/acceptRequest/:id',
    isAuth,
    verifyRole(['Dashboard']),
    providerDashboard.acceptRequest,
);

router.patch(
    '/updateNotes/:id',
    isAuth,
    verifyRole(['Dashboard']),
    celebrate(ProviderSchema.updateNotes),
    providerDashboard.updateNotes,
);

router.patch(
    '/concludeCare/:id',
    isAuth,
    verifyRole(['Dashboard']),
    celebrate(ProviderSchema.concludeCare),
    providerDashboard.concludeCare,
);

router.patch(
    '/typeOfCare/:id',
    isAuth,
    verifyRole(['Dashboard']),
    celebrate(ProviderSchema.typeOfCare),
    providerDashboard.typeOfCare,
);

router.patch(
    '/houseCallType/:id',
    isAuth,
    verifyRole(['Dashboard']),
    providerDashboard.houseCallType,
);

router.patch(
    '/transferRequest/:id',
    isAuth,
    verifyRole(['Dashboard']),
    celebrate(ProviderSchema.transferRequest),
    providerDashboard.transferRequest,
);

router.post(
    '/encounterForm/:id',
    isAuth,
    verifyRole(['Dashboard']),
    celebrate(ProviderSchema.encounterForm),
    providerDashboard.encounterForm,
);

router.patch(
    '/finalizeForm/:id',
    isAuth,
    verifyRole(['Dashboard']),
    providerDashboard.finalizeForm,
);

router.get(
    '/viewEncounterForm/:id',
    isAuth,
    verifyRole(['Dashboard']),
    providerDashboard.viewEncounterForm,
);

router.patch(
    '/editEncounterForm/:id',
    isAuth,
    verifyRole(['Dashboard']),
    celebrate(ProviderSchema.encounterForm),
    providerDashboard.editEncounterForm,
);

router.get(
    '/download/:id',
    verifyRole(['Dashboard']),
    providerDashboard.downloadEncounter,
);

export default router;
