import { StatusCodes } from 'http-status-codes'

import { sendResponse } from '@src/helpers/response.helpers'
import DeleteFeedbackDraftService from '@src/services/feedback/deleteFeedbackDraft.service'
import GetFeedbackOptionsService from '@src/services/feedback/getFeedbackOptions.service'
import ListFeedbackService from '@src/services/feedback/listFeedback.service'
import CreateProjectFeedbackService from '@src/services/projects/createProjectFeedback.service'
import UpdateProjectFeedbackService from '@src/services/projects/updateProjectFeedback.service'

class FeedbackController {
  static async list (request, response, next) {
    try {
      const result = await ListFeedbackService.execute(
        request.query,
        request.context
      )

      sendResponse({ response }, result)
    } catch (error) {
      next(error)
    }
  }

  static async options (request, response, next) {
    try {
      const result = await GetFeedbackOptionsService.execute(
        {},
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
        request.body,
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
          feedbackId: request.params.feedbackId
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

  static async deleteDraft (request, response, next) {
    try {
      const result = await DeleteFeedbackDraftService.execute(
        {
          feedbackId: request.params.feedbackId
        },
        request.context
      )

      sendResponse({ response }, result, {
        message: 'Feedback draft discarded'
      })
    } catch (error) {
      next(error)
    }
  }
}

export default FeedbackController
