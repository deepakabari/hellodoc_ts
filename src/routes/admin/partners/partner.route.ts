import { partnerController } from '../../../controllers/index';
import express from 'express';
import isAuth from '../../../middleware/in-auth';
import { celebrate } from 'celebrate';
import { BusinessSchema } from '../../../validations/index';
const router = express.Router();

router.post(
    '/addBusiness',
    isAuth,
    celebrate(BusinessSchema.createBusiness),
    partnerController.addBusiness,
);

router.get('/viewBusiness/:id', isAuth, partnerController.viewBusiness);

router.get('/professions', isAuth, partnerController.professions);

router.get(
    '/businessByProfession/:profession',
    isAuth,
    partnerController.businessByProfession,
);

router.get('/viewSendOrder/:id', isAuth, partnerController.viewSendOrder);

router.post('/sendOrder/:id', isAuth, partnerController.sendOrder);

export default router;
