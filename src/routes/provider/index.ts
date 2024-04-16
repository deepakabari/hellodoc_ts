import { Router } from 'express';
import dashboardRoutes from './Dashboard/dashboard.route';
import providerProfileRoutes from './MyProfile/myProfile.route';
import providerSchedule from './Schedule/schedule.route';

const router: Router = Router();

router.use('/dashboard', dashboardRoutes);
router.use('/profile', providerProfileRoutes);
router.use('/schedule', providerSchedule);

export default router;
