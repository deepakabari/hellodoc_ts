import { commonController } from '../../../controllers/index';
import express from 'express';
import isAuth from '../../../middleware/in-auth';

const router = express.Router();

router.get('/getLoggedUser/:email', isAuth, commonController.getLoggedData);

router.post('/download', isAuth, commonController.downloadFile);

router.get('/viewFile/:fileName', isAuth, commonController.viewFile);

router.get('/export/:state', isAuth, commonController.exportFile);

router.get('/exportAll', isAuth, commonController.exportAll);

router.post('/verifyRegion', isAuth, commonController.verifyState);

router.get('/getRoles', isAuth, commonController.getRoles);

router.delete('/deleteFile/:id', isAuth, commonController.deleteFile);

export default router;
