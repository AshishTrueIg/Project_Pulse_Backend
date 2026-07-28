import { Router } from 'express'

import ProjectFeedbackController from '@src/rest-resources/controllers/projectFeedback.controller'
import ProjectFinancialsController from '@src/rest-resources/controllers/projectFinancials.controller'
import ProjectResourcesController from '@src/rest-resources/controllers/projectResources.controller'
import ProjectsController from '@src/rest-resources/controllers/projects.controller'
import asyncHandler from '@src/rest-resources/middlewares/asyncHandler.middleware'
import authenticate from '@src/rest-resources/middlewares/authenticate.middleware'
import authorize from '@src/rest-resources/middlewares/authorize.middleware'
import validateRequest from '@src/rest-resources/middlewares/validateRequest.middleware'
import projectValidators from '@src/rest-resources/validators/projects.validator'

const router = Router()
const canReadProjects = authorize('projects:read', 'projects:read:assigned')
const canManageDelivery = authorize(
  'projects:write',
  'projects:update:assigned'
)
const canManageFeedback = authorize(
  'feedback:write',
  'feedback:write:assigned'
)
const canReadFeedback = authorize(
  'feedback:write',
  'feedback:write:assigned',
  'feedback:read:own'
)

router.use(asyncHandler(authenticate))

router.get(
  '/',
  canReadProjects,
  projectValidators.list(),
  validateRequest,
  ProjectsController.list
)
router.get(
  '/options',
  canManageDelivery,
  ProjectsController.options
)
router.post(
  '/',
  authorize('projects:write'),
  projectValidators.projectCreate(),
  validateRequest,
  ProjectsController.create
)

router.get(
  '/:projectId',
  canReadProjects,
  projectValidators.get(),
  validateRequest,
  ProjectsController.getById
)
router.patch(
  '/:projectId',
  canManageDelivery,
  projectValidators.projectUpdate(),
  validateRequest,
  ProjectsController.update
)

router.post(
  '/:projectId/milestones',
  canManageDelivery,
  projectValidators.milestoneCreate(),
  validateRequest,
  ProjectResourcesController.createMilestone
)
router.patch(
  '/:projectId/milestones/:milestoneId',
  canManageDelivery,
  projectValidators.milestoneUpdate(),
  validateRequest,
  ProjectResourcesController.updateMilestone
)

router.post(
  '/:projectId/members',
  canManageDelivery,
  projectValidators.memberCreate(),
  validateRequest,
  ProjectResourcesController.createMember
)
router.patch(
  '/:projectId/members/:assignmentId',
  canManageDelivery,
  projectValidators.memberUpdate(),
  validateRequest,
  ProjectResourcesController.updateMember
)
router.delete(
  '/:projectId/members/:assignmentId',
  canManageDelivery,
  projectValidators.memberDeactivate(),
  validateRequest,
  ProjectResourcesController.deactivateMember
)

router.post(
  '/:projectId/risks',
  canManageDelivery,
  projectValidators.riskCreate(),
  validateRequest,
  ProjectResourcesController.createRisk
)
router.patch(
  '/:projectId/risks/:riskId',
  canManageDelivery,
  projectValidators.riskUpdate(),
  validateRequest,
  ProjectResourcesController.updateRisk
)

router.get(
  '/:projectId/feedback',
  canReadFeedback,
  projectValidators.feedbackList(),
  validateRequest,
  ProjectFeedbackController.list
)
router.post(
  '/:projectId/feedback',
  canManageFeedback,
  projectValidators.feedbackCreate(),
  validateRequest,
  ProjectFeedbackController.create
)
router.patch(
  '/:projectId/feedback/:feedbackId',
  canReadFeedback,
  projectValidators.feedbackUpdate(),
  validateRequest,
  ProjectFeedbackController.update
)

router.get(
  '/:projectId/financials',
  authorize('financials:read', 'financials:write'),
  projectValidators.financialsGet(),
  validateRequest,
  ProjectFinancialsController.get
)
router.put(
  '/:projectId/financials/contract',
  authorize('financials:write'),
  projectValidators.contractUpsert(),
  validateRequest,
  ProjectFinancialsController.upsertContract
)
router.post(
  '/:projectId/financials/billing-records',
  authorize('financials:write'),
  projectValidators.billingCreate(),
  validateRequest,
  ProjectFinancialsController.createBillingRecord
)
router.patch(
  '/:projectId/financials/billing-records/:billingRecordId',
  authorize('financials:write'),
  projectValidators.billingUpdate(),
  validateRequest,
  ProjectFinancialsController.updateBillingRecord
)

export default router
