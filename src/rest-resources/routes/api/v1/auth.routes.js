import { Router } from 'express'
import { body } from 'express-validator'

import AuthController from '@src/rest-resources/controllers/auth.controller'
import InvitationsController from '@src/rest-resources/controllers/invitations.controller'
import asyncHandler from '@src/rest-resources/middlewares/asyncHandler.middleware'
import authenticate from '@src/rest-resources/middlewares/authenticate.middleware'
import validateRequest from '@src/rest-resources/middlewares/validateRequest.middleware'
import invitationsValidators from '@src/rest-resources/validators/invitations.validator'

const router = Router()

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Enter a valid email address').normalizeEmail(),
    body('password').isString().isLength({ min: 8 }).withMessage('Password must contain at least 8 characters')
  ],
  validateRequest,
  AuthController.login
)
router.post(
  '/invitations/validate',
  invitationsValidators.validate(),
  validateRequest,
  InvitationsController.validate
)
router.post(
  '/invitations/accept',
  invitationsValidators.accept(),
  validateRequest,
  InvitationsController.accept
)
router.post('/refresh', AuthController.refresh)
router.post('/logout', AuthController.logout)
router.get('/me', asyncHandler(authenticate), AuthController.me)

export default router
