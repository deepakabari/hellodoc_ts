import { commonController } from '../../../controllers/index';
import express from 'express';
import isAuth from '../../../middleware/in-auth';

const router = express.Router();

router.get('/getLoggedUser/:email', isAuth, commonController.getLoggedData);

router.get("/download/:fileName", commonController.downloadFile)

export default router;
