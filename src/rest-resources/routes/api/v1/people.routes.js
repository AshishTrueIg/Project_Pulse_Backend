import { Router } from 'express'

import PeopleController from '@src/rest-resources/controllers/people.controller'
import InvitationsController from '@src/rest-resources/controllers/invitations.controller'
import asyncHandler from '@src/rest-resources/middlewares/asyncHandler.middleware'
import authenticate from '@src/rest-resources/middlewares/authenticate.middleware'
import authorize from '@src/rest-resources/middlewares/authorize.middleware'
import validateRequest from '@src/rest-resources/middlewares/validateRequest.middleware'
import peopleValidators from '@src/rest-resources/validators/people.validator'
import invitationsValidators from '@src/rest-resources/validators/invitations.validator'

const router = Router()
const canReadPeople = authorize(
  'people:read',
  'people:read:assigned',
  'people:read:self',
  'people:write'
)

router.use(asyncHandler(authenticate))

router.get(
  '/',
  canReadPeople,
  peopleValidators.list(),
  validateRequest,
  PeopleController.list
)
router.get(
  '/options',
  authorize('people:write'),
  PeopleController.options
)
router.get(
  '/invitations',
  authorize('people:write'),
  invitationsValidators.list(),
  validateRequest,
  InvitationsController.list
)
router.post(
  '/invitations',
  authorize('people:write'),
  invitationsValidators.create(),
  validateRequest,
  InvitationsController.create
)
router.post(
  '/invitations/:invitationId/resend',
  authorize('people:write'),
  invitationsValidators.resend(),
  validateRequest,
  InvitationsController.resend
)
router.delete(
  '/invitations/:invitationId',
  authorize('people:write'),
  invitationsValidators.revoke(),
  validateRequest,
  InvitationsController.revoke
)
router.get(
  '/:personId',
  canReadPeople,
  peopleValidators.get(),
  validateRequest,
  PeopleController.getById
)
router.patch(
  '/:personId',
  authorize('people:write'),
  peopleValidators.update(),
  validateRequest,
  PeopleController.update
)

export default router
