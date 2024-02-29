import { Router } from "express";
import authRoutes from "./auth.routes";
import userRoutes from "./user.routes";
import adminRoutes from './admin.routes'

const router: Router = Router();

router.use("/user", userRoutes);
router.use("/auth", authRoutes);
router.use('/admin', adminRoutes)

export default router;
