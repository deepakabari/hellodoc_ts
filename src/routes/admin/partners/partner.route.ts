import { partnerController } from '../../../controllers/index';
import express from 'express';
import isAuth from '../../../middleware/in-auth';
import { celebrate } from 'celebrate';
import {
    BusinessSchema,
    PartnerSchema,
    RequestSchema,
} from '../../../validations/index';
const router = express.Router();

router.post(
    '/addBusiness',
    isAuth,
    celebrate(BusinessSchema.createBusiness),
    partnerController.addBusiness,
);

router.get(
    '/viewBusiness/:id',
    isAuth,
    celebrate(RequestSchema.idParams),
    partnerController.viewBusiness,
);

router.get('/professions', isAuth, partnerController.professions);

router.get(
    '/businessByProfession/:profession',
    isAuth,
    partnerController.businessByProfession,
);

router.get(
    '/viewSendOrder/:id',
    isAuth,
    celebrate(RequestSchema.idParams),
    partnerController.viewSendOrder,
);

router.post(
    '/sendOrder/:id',
    isAuth,
    celebrate(PartnerSchema.sendOrder),
    partnerController.sendOrder,
);

router.get('/viewVendor', isAuth, partnerController.viewVendor);

router.patch('/updateBusiness/:id', isAuth, partnerController.updateBusiness);

router.delete('/deleteBusiness/:id', isAuth, partnerController.deleteBusiness);

export default router;
