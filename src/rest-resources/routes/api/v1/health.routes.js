import { Router } from 'express'

import healthController from '@src/rest-resources/controllers/health.controller'

const router = Router()

router.get('/', healthController)

export default router
