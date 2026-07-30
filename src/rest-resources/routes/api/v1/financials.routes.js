import { Router } from 'express'

import FinancialsController from '@src/rest-resources/controllers/financials.controller'
import asyncHandler from '@src/rest-resources/middlewares/asyncHandler.middleware'
import authenticate from '@src/rest-resources/middlewares/authenticate.middleware'
import authorize from '@src/rest-resources/middlewares/authorize.middleware'
import validateRequest from '@src/rest-resources/middlewares/validateRequest.middleware'
import financialsValidators from '@src/rest-resources/validators/financials.validator'

const router = Router()

router.use(asyncHandler(authenticate))

router.get(
  '/',
  authorize('financials:read', 'financials:write'),
  financialsValidators.list(),
  validateRequest,
  FinancialsController.list
)

export default router
