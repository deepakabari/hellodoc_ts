import express from 'express';
import isAuth from '../../../middleware/in-auth';
import { providerSchedule } from '../../../controllers';

const router = express.Router();

router.get('/mySchedule', isAuth, providerSchedule.viewSchedule);

export default router;