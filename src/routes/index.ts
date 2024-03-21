import { Router } from 'express';
import authRoutes from './auth/auth.routes';
import userRoutes from './user/user.routes';
import adminRoutes from './admin/index';

const router: Router = Router();

router.use('/user', userRoutes);
router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);

export default router;
