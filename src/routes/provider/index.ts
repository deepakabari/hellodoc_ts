import { Router } from 'express';
import dashboardRoutes from './Dashboard/dashboard.route';
import providerProfileRoutes from './MyProfile/myProfile.route';

const router: Router = Router();

router.use('/dashboard', dashboardRoutes);
router.use('/profile', providerProfileRoutes);

export default router;
