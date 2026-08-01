import { Router } from 'express'

import SettingsController from '@src/rest-resources/controllers/settings.controller'
import asyncHandler from '@src/rest-resources/middlewares/asyncHandler.middleware'
import authenticate from '@src/rest-resources/middlewares/authenticate.middleware'
import authorize from '@src/rest-resources/middlewares/authorize.middleware'
import validateRequest from '@src/rest-resources/middlewares/validateRequest.middleware'
import settingsValidators from '@src/rest-resources/validators/settings.validator'

const router = Router()

router.use(asyncHandler(authenticate))

router.get(
  '/',
  authorize('settings:read', 'settings:write'),
  SettingsController.get
)

router.patch(
  '/company',
  authorize('settings:write'),
  settingsValidators.updateCompany(),
  validateRequest,
  SettingsController.updateCompany
)

router.patch(
  '/health-policy',
  authorize('settings:write'),
  settingsValidators.updateHealthPolicy(),
  validateRequest,
  SettingsController.updateHealthPolicy
)

router.get(
  '/activity',
  authorize('audit:read'),
  settingsValidators.activity(),
  validateRequest,
  SettingsController.activity
)

export default router
