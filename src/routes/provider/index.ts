import { Router } from 'express';
import dashboardRoutes from './Dashboard/dashboard.route';

const router: Router = Router();

router.use('/dashboard', dashboardRoutes)

export default router;
