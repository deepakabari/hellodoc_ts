import { commonController } from '../../../controllers/index';
import express from 'express';
import isAuth from '../../../middleware/in-auth';

const router = express.Router();

router.get('/getLoggedUser', isAuth, commonController.getLoggedData);

export default router;
