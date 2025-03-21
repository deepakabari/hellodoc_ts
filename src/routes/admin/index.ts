import { Router } from 'express';
import dashboardRoutes from './dashboard/dashboard.route';
import accessRoutes from './access/access.route';
import profileRoute from './profile/profile.route';
import providerRoutes from './providers/provider.route';
import recordRoutes from './records/records.route';
import partnerRoutes from './partners/partner.route';
import commonRoutes from './common/common.route';
import adminInvoiceRoutes from './invoicing/invoicing.route';

const router: Router = Router();

router.use('/dashboard', dashboardRoutes);
router.use('/access', accessRoutes);
router.use('/profile', profileRoute);
router.use('/provider', providerRoutes);
router.use('/records', recordRoutes);
router.use('/partner', partnerRoutes);
router.use('/common', commonRoutes);
router.use('/invoice', adminInvoiceRoutes);

export default router;
