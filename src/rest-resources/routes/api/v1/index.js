import { Router } from 'express'

import authRoutes from './auth.routes'
import dashboardRoutes from './dashboard.routes'
import healthRoutes from './health.routes'
import peopleRoutes from './people.routes'
import projectsRoutes from './projects.routes'

const router = Router()

router.use('/auth', authRoutes)
router.use('/dashboard', dashboardRoutes)
router.use('/health', healthRoutes)
router.use('/people', peopleRoutes)
router.use('/projects', projectsRoutes)

export default router
