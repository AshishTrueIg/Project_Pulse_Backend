import { sendResponse } from '@src/helpers/response.helpers'
import GetSettingsService from '@src/services/settings/getSettings.service'
import ListActivityService from '@src/services/settings/listActivity.service'
import UpdateCompanySettingsService from '@src/services/settings/updateCompanySettings.service'
import UpdateHealthPolicyService from '@src/services/settings/updateHealthPolicy.service'

class SettingsController {
  static async get (request, response, next) {
    try {
      const result = await GetSettingsService.execute(
        {},
        request.context
      )

      sendResponse({ response }, result)
    } catch (error) {
      next(error)
    }
  }

  static async updateCompany (request, response, next) {
    try {
      const result = await UpdateCompanySettingsService.execute(
        request.body,
        request.context
      )

      sendResponse({ response }, result)
    } catch (error) {
      next(error)
    }
  }

  static async updateHealthPolicy (request, response, next) {
    try {
      const result = await UpdateHealthPolicyService.execute(
        request.body,
        request.context
      )

      sendResponse({ response }, result)
    } catch (error) {
      next(error)
    }
  }

  static async activity (request, response, next) {
    try {
      const result = await ListActivityService.execute(
        request.query,
        request.context
      )

      sendResponse({ response }, result)
    } catch (error) {
      next(error)
    }
  }
}

export default SettingsController
