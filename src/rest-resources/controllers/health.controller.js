import { sendResponse } from '@src/helpers/response.helpers'
import GetHealthService from '@src/services/health/getHealth.service'

class HealthController {
  static async getHealth (request, response, next) {
    try {
      const result = await GetHealthService.execute({}, request.context)

      sendResponse({ response }, result)
    } catch (error) {
      next(error)
    }
  }
}

export default HealthController
