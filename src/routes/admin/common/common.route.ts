import { commonController } from '../../../controllers/index';
import express from 'express';
import isAuth from '../../../middleware/in-auth';

const router = express.Router();

router.get('/getLoggedUser/:email', isAuth, commonController.getLoggedData);

router.post("/download", isAuth, commonController.downloadFile)

router.post('/deleteFile/:id', isAuth, commonController.deleteFile)

export default router;