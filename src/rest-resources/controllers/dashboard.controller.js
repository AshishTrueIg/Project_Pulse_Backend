import { sendResponse } from '@src/helpers/response.helpers'
import GetManagerOverviewService from '@src/services/dashboard/getManagerOverview.service'

class DashboardController {
  static async getOverview (request, response, next) {
    try {
      const result = await GetManagerOverviewService.execute({}, request.context)

      sendResponse({ response }, result)
    } catch (error) {
      next(error)
    }
  }
}

export default DashboardController
