import { Router } from 'express'

import authRoutes from './auth.routes'
import dashboardRoutes from './dashboard.routes'
import healthRoutes from './health.routes'

const router = Router()

router.use('/auth', authRoutes)
router.use('/dashboard', dashboardRoutes)
router.use('/health', healthRoutes)

export default router
