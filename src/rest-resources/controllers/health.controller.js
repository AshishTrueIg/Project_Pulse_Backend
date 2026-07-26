import { StatusCodes } from 'http-status-codes'

import getHealth from '@src/services/health/getHealth.service'

const healthController = (request, response) => {
  response.status(StatusCodes.OK).json({
    data: getHealth()
  })
}

export default healthController
