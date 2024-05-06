import express from 'express';
import isAuth from '../../../middleware/in-auth';
import { adminInvoicing } from '../../../controllers';
import { celebrate } from 'celebrate';
import { InvoicingSchema } from '../../../validations/invoicingSchema.valid';
const router = express.Router();

router.get('/getPayRate/:id', isAuth, adminInvoicing.getPayRate);

router.post(
    '/addPayRate',
    isAuth,
    celebrate(InvoicingSchema.addPayRate),
    adminInvoicing.addPayRate,
);

router.patch(
    '/editPayRate',
    isAuth,
    celebrate(InvoicingSchema.addPayRate),
    adminInvoicing.editPayrate,
);

export default router;
