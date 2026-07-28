import { StatusCodes } from 'http-status-codes'

import { sendResponse } from '@src/helpers/response.helpers'
import GetProjectFinancialsService from '@src/services/projects/getProjectFinancials.service'
import UpsertBillingRecordService from '@src/services/projects/upsertBillingRecord.service'
import UpsertProjectContractService from '@src/services/projects/upsertProjectContract.service'

class ProjectFinancialsController {
  static async get (request, response, next) {
    try {
      const result = await GetProjectFinancialsService.execute(
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

  static async upsertContract (request, response, next) {
    try {
      const result = await UpsertProjectContractService.execute(
        {
          ...request.body,
          projectId: request.params.projectId
        },
        request.context
      )

      sendResponse({ response }, result, {
        message: 'Project contract saved'
      })
    } catch (error) {
      next(error)
    }
  }

  static async createBillingRecord (request, response, next) {
    try {
      const result = await UpsertBillingRecordService.execute(
        {
          ...request.body,
          projectId: request.params.projectId
        },
        request.context
      )

      sendResponse({ response }, result, {
        message: 'Billing record created',
        statusCode: StatusCodes.CREATED
      })
    } catch (error) {
      next(error)
    }
  }

  static async updateBillingRecord (request, response, next) {
    try {
      const result = await UpsertBillingRecordService.execute(
        {
          ...request.body,
          billingRecordId: request.params.billingRecordId,
          projectId: request.params.projectId
        },
        request.context
      )

      sendResponse({ response }, result, {
        message: 'Billing record updated'
      })
    } catch (error) {
      next(error)
    }
  }
}

export default ProjectFinancialsController
