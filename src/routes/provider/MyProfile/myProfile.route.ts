import express from 'express';
import isAuth from '../../../middleware/in-auth';
import { providerProfile } from '../../../controllers';

const router = express.Router();

router.post('/requestToAdmin/:id', isAuth, providerProfile.requestToAdmin);

export default router;
