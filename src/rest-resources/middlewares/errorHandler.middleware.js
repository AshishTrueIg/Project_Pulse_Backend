import { StatusCodes } from 'http-status-codes'

import logger from '@src/utils/logger'

// Express identifies error middleware by its four-argument signature.
// eslint-disable-next-line no-unused-vars
const errorHandler = (error, request, response, next) => {
  const statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR

  logger.error(
    {
      error,
      method: request.method,
      path: request.originalUrl
    },
    'Request failed'
  )

  response.status(statusCode).json({
    error: {
      message: statusCode === StatusCodes.INTERNAL_SERVER_ERROR ? 'Internal server error' : error.message,
      details: error.details || null
    }
  })
}

export default errorHandler
