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
import verifyRole from '../../../middleware/verifyRole';

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
    '/businessByProfession/:professionId',
    isAuth,
    partnerController.businessByProfession,
);

router.get(
    '/viewSendOrder/:id',
    isAuth, verifyRole(['Dashboard', 'SendOrder']),
    celebrate(RequestSchema.idParams),
    partnerController.viewSendOrder,
);

router.post(
    '/sendOrder/:id',
    isAuth, verifyRole(['Dashboard', 'SendOrder']),
    celebrate(PartnerSchema.sendOrder),
    partnerController.sendOrder,
);

router.get('/viewVendor', isAuth, verifyRole(['Dashboard', 'VendorsInfo']), partnerController.viewVendor);

router.patch(
    '/updateBusiness/:id',
    isAuth,
    celebrate(BusinessSchema.updateBusiness),
    partnerController.updateBusiness,
);

router.delete('/deleteBusiness/:id', isAuth, partnerController.deleteBusiness);

export default router;
