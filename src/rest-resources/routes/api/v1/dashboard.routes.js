import { Router } from 'express'

import getOverviewController from '@src/rest-resources/controllers/dashboard.controller'
import asyncHandler from '@src/rest-resources/middlewares/asyncHandler.middleware'
import authenticate from '@src/rest-resources/middlewares/authenticate.middleware'
import authorize from '@src/rest-resources/middlewares/authorize.middleware'

const router = Router()

router.get(
  '/overview',
  asyncHandler(authenticate),
  authorize('dashboard:read'),
  asyncHandler(getOverviewController)
)

export default router
