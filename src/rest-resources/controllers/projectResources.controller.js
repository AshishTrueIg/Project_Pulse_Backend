import { StatusCodes } from 'http-status-codes'

import { sendResponse } from '@src/helpers/response.helpers'
import CreateProjectHealthUpdateService from '@src/services/projects/createProjectHealthUpdate.service'
import DeactivateProjectMemberService from '@src/services/projects/deactivateProjectMember.service'
import UpsertMilestoneService from '@src/services/projects/upsertMilestone.service'
import UpsertProjectMemberService from '@src/services/projects/upsertProjectMember.service'
import UpsertRiskService from '@src/services/projects/upsertRisk.service'

class ProjectResourcesController {
  static async createHealthUpdate (request, response, next) {
    try {
      const result = await CreateProjectHealthUpdateService.execute(
        {
          ...request.body,
          projectId: request.params.projectId
        },
        request.context
      )

      sendResponse({ response }, result, {
        message: 'Weekly project update submitted',
        statusCode: StatusCodes.CREATED
      })
    } catch (error) {
      next(error)
    }
  }

  static async createMilestone (request, response, next) {
    try {
      const result = await UpsertMilestoneService.execute(
        {
          ...request.body,
          projectId: request.params.projectId
        },
        request.context
      )

      sendResponse({ response }, result, {
        message: 'Milestone created',
        statusCode: StatusCodes.CREATED
      })
    } catch (error) {
      next(error)
    }
  }

  static async updateMilestone (request, response, next) {
    try {
      const result = await UpsertMilestoneService.execute(
        {
          ...request.body,
          milestoneId: request.params.milestoneId,
          projectId: request.params.projectId
        },
        request.context
      )

      sendResponse({ response }, result, {
        message: 'Milestone updated'
      })
    } catch (error) {
      next(error)
    }
  }

  static async createMember (request, response, next) {
    try {
      const result = await UpsertProjectMemberService.execute(
        {
          ...request.body,
          projectId: request.params.projectId
        },
        request.context
      )

      sendResponse({ response }, result, {
        message: 'Team member added',
        statusCode: StatusCodes.CREATED
      })
    } catch (error) {
      next(error)
    }
  }

  static async updateMember (request, response, next) {
    try {
      const result = await UpsertProjectMemberService.execute(
        {
          ...request.body,
          assignmentId: request.params.assignmentId,
          projectId: request.params.projectId
        },
        request.context
      )

      sendResponse({ response }, result, {
        message: 'Team member updated'
      })
    } catch (error) {
      next(error)
    }
  }

  static async deactivateMember (request, response, next) {
    try {
      const result = await DeactivateProjectMemberService.execute(
        {
          ...request.body,
          assignmentId: request.params.assignmentId,
          projectId: request.params.projectId
        },
        request.context
      )

      sendResponse({ response }, result, {
        message: 'Team member removed'
      })
    } catch (error) {
      next(error)
    }
  }

  static async createRisk (request, response, next) {
    try {
      const result = await UpsertRiskService.execute(
        {
          ...request.body,
          projectId: request.params.projectId
        },
        request.context
      )

      sendResponse({ response }, result, {
        message: 'Risk created',
        statusCode: StatusCodes.CREATED
      })
    } catch (error) {
      next(error)
    }
  }

  static async updateRisk (request, response, next) {
    try {
      const result = await UpsertRiskService.execute(
        {
          ...request.body,
          projectId: request.params.projectId,
          riskId: request.params.riskId
        },
        request.context
      )

      sendResponse({ response }, result, {
        message: 'Risk updated'
      })
    } catch (error) {
      next(error)
    }
  }
}

export default ProjectResourcesController
