import { sendResponse } from '@src/helpers/response.helpers'
import ListFinancialPortfolioService from '@src/services/financials/listFinancialPortfolio.service'

class FinancialsController {
  static async list (request, response, next) {
    try {
      const result = await ListFinancialPortfolioService.execute(
        request.query,
        request.context
      )

      sendResponse({ response }, result)
    } catch (error) {
      next(error)
    }
  }
}

export default FinancialsController
