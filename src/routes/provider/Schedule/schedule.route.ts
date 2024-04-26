import express from 'express';
import isAuth from '../../../middleware/in-auth';
import { providerSchedule } from '../../../controllers';
import verifyRole from '../../../middleware/verifyRole';

const router = express.Router();

router.get(
    '/mySchedule',
    isAuth,
    verifyRole(['MySchedule']),
    providerSchedule.viewSchedule,
);

router.get(
    '/invoice/:id',
    verifyRole(['Invoicing']),
    providerSchedule.invoices,
);

export default router;
