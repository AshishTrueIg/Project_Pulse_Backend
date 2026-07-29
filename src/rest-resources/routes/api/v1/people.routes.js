import { Router } from 'express'

import PeopleController from '@src/rest-resources/controllers/people.controller'
import asyncHandler from '@src/rest-resources/middlewares/asyncHandler.middleware'
import authenticate from '@src/rest-resources/middlewares/authenticate.middleware'
import authorize from '@src/rest-resources/middlewares/authorize.middleware'
import validateRequest from '@src/rest-resources/middlewares/validateRequest.middleware'
import peopleValidators from '@src/rest-resources/validators/people.validator'

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
