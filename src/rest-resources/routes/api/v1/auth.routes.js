import { Router } from 'express'
import { body } from 'express-validator'

import {
  loginController,
  logoutController,
  meController,
  refreshController
} from '@src/rest-resources/controllers/auth.controller'
import asyncHandler from '@src/rest-resources/middlewares/asyncHandler.middleware'
import authenticate from '@src/rest-resources/middlewares/authenticate.middleware'
import validateRequest from '@src/rest-resources/middlewares/validateRequest.middleware'

const router = Router()

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Enter a valid email address').normalizeEmail(),
    body('password').isString().isLength({ min: 8 }).withMessage('Password must contain at least 8 characters')
  ],
  validateRequest,
  asyncHandler(loginController)
)
router.post('/refresh', asyncHandler(refreshController))
router.post('/logout', asyncHandler(logoutController))
router.get('/me', asyncHandler(authenticate), asyncHandler(meController))

export default router
