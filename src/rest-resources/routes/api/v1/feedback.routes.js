import { Router } from 'express'

import FeedbackController from '@src/rest-resources/controllers/feedback.controller'
import asyncHandler from '@src/rest-resources/middlewares/asyncHandler.middleware'
import authenticate from '@src/rest-resources/middlewares/authenticate.middleware'
import authorize from '@src/rest-resources/middlewares/authorize.middleware'
import validateRequest from '@src/rest-resources/middlewares/validateRequest.middleware'
import feedbackValidators from '@src/rest-resources/validators/feedback.validator'

const router = Router()
const canManageFeedback = authorize(
  'feedback:write',
  'feedback:write:assigned'
)
const canReadFeedback = authorize(
  'feedback:read',
  'feedback:write',
  'feedback:write:assigned',
  'feedback:read:own'
)

router.use(asyncHandler(authenticate))

router.get(
  '/',
  canReadFeedback,
  feedbackValidators.list(),
  validateRequest,
  FeedbackController.list
)
router.get(
  '/options',
  canManageFeedback,
  FeedbackController.options
)
router.post(
  '/',
  canManageFeedback,
  feedbackValidators.create(),
  validateRequest,
  FeedbackController.create
)
router.patch(
  '/:feedbackId',
  canReadFeedback,
  feedbackValidators.update(),
  validateRequest,
  FeedbackController.update
)
router.delete(
  '/:feedbackId',
  canManageFeedback,
  feedbackValidators.delete(),
  validateRequest,
  FeedbackController.deleteDraft
)

export default router
