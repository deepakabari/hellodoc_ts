import { Router } from 'express'
import dashboardRoutes from './dashboard/dashboard.route'
import accessRoutes from './access/access.route'
import profileRoute from './profile/profile.route'
import providerRoutes from './providers/provider.route'
import recordRoutes from './records/records.route'

const router: Router = Router();

router.use("/dashboard", dashboardRoutes)
router.use("/access", accessRoutes)
router.use("/profile", profileRoute)
router.use("/provider", providerRoutes)
router.use("/records", recordRoutes)

export default router;