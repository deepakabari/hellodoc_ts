import express from 'express';
import isAuth from '../../../middleware/in-auth';
import { providerSchedule } from '../../../controllers';
import verifyRole from '../../../middleware/verifyRole';

const router = express.Router();

router.get(
    '/mySchedule',
    isAuth,
    verifyRole(['Scheduling']),
    providerSchedule.viewSchedule,
);

router.get(
    '/invoice/:id',
    isAuth,
    verifyRole(['Invoicing']),
    providerSchedule.invoices,
);

export default router;
