import { commonController } from '../../../controllers/index';
import express from 'express';
import isAuth from '../../../middleware/in-auth';

const router = express.Router();

router.get('/getLoggedUser/:email', isAuth, commonController.getLoggedData);

router.post("/download", isAuth, commonController.downloadFile)

router.delete('/deleteFile/:id', isAuth, commonController.deleteFile)

router.get('/export/:state', commonController.exportFile)

router.get("/exportAll", commonController.exportAll)

router.post('/verifyRegion', isAuth, commonController.verifyState)

export default router;
