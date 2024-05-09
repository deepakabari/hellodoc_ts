import express from 'express';
import isAuth from '../../../middleware/in-auth';
import { providerInvoicing } from '../../../controllers';
import { upload } from '../../../utils/multerConfig';
import { celebrate } from 'celebrate';
import { InvoicingSchema } from '../../../validations/invoicingSchema.valid';
const router = express.Router();

router.get(
    '/getInvoiceData',
    isAuth,
    celebrate(InvoicingSchema.timesheet),
    providerInvoicing.getInvoiceData,
);

router.post(
    '/insertWeeklyRecords',
    isAuth,
    upload.fields([
        // Dynamically generate fields based on the date range
        ...Array.from({ length: 31 }, (_, index) => ({
            name: `bill[${index + 1}]`,
            maxCount: 1,
        })),
    ]),
    celebrate(InvoicingSchema.insertWeeklyRecords),
    providerInvoicing.insertWeeklyRecords,
);

router.patch('/finalizeTimeSheet', isAuth, providerInvoicing.finalizeRecord);

export default router;
