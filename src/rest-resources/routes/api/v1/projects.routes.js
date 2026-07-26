import { Router } from 'express'
import { param, query } from 'express-validator'

import ProjectsController from '@src/rest-resources/controllers/projects.controller'
import asyncHandler from '@src/rest-resources/middlewares/asyncHandler.middleware'
import authenticate from '@src/rest-resources/middlewares/authenticate.middleware'
import authorize from '@src/rest-resources/middlewares/authorize.middleware'
import validateRequest from '@src/rest-resources/middlewares/validateRequest.middleware'

const router = Router()

router.use(asyncHandler(authenticate))
router.use(authorize('projects:read', 'projects:read:assigned'))

router.get(
  '/',
  [
    query('health')
      .optional()
      .isIn(['green', 'amber', 'red', 'not_assessed'])
      .withMessage('Enter a valid project health'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be greater than zero'),
    query('search')
      .optional()
      .trim()
      .isLength({ min: 1, max: 180 })
      .withMessage('Search must contain between 1 and 180 characters'),
    query('stage')
      .optional()
      .trim()
      .isLength({ min: 1, max: 64 })
      .withMessage('Enter a valid project stage'),
    query('status')
      .optional()
      .isIn(['active', 'upcoming', 'on_hold', 'maintenance', 'completed'])
      .withMessage('Enter a valid project status')
  ],
  validateRequest,
  ProjectsController.list
)

router.get(
  '/:projectId',
  [
    param('projectId').isUUID().withMessage('Enter a valid project ID')
  ],
  validateRequest,
  ProjectsController.getById
)

export default router
