import { StatusCodes } from 'http-status-codes'

import { sendResponse } from '@src/helpers/response.helpers'
import CreateProjectFeedbackService from '@src/services/projects/createProjectFeedback.service'
import ListProjectFeedbackService from '@src/services/projects/listProjectFeedback.service'
import UpdateProjectFeedbackService from '@src/services/projects/updateProjectFeedback.service'

class ProjectFeedbackController {
  static async list (request, response, next) {
    try {
      const result = await ListProjectFeedbackService.execute(
        {
          projectId: request.params.projectId
        },
        request.context
      )

      sendResponse({ response }, result)
    } catch (error) {
      next(error)
    }
  }

  static async create (request, response, next) {
    try {
      const result = await CreateProjectFeedbackService.execute(
        {
          ...request.body,
          projectId: request.params.projectId
        },
        request.context
      )

      sendResponse({ response }, result, {
        message: 'Feedback created',
        statusCode: StatusCodes.CREATED
      })
    } catch (error) {
      next(error)
    }
  }

  static async update (request, response, next) {
    try {
      const result = await UpdateProjectFeedbackService.execute(
        {
          ...request.body,
          feedbackId: request.params.feedbackId,
          projectId: request.params.projectId
        },
        request.context
      )

      sendResponse({ response }, result, {
        message: 'Feedback updated'
      })
    } catch (error) {
      next(error)
    }
  }
}

export default ProjectFeedbackController
