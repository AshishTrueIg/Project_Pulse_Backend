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
    success: false,
    error: {
      code: error.code || 'INTERNAL_ERROR',
      message:
        statusCode === StatusCodes.INTERNAL_SERVER_ERROR
          ? 'Internal server error'
          : error.message,
      details: error.details || null,
      traceId: request.context?.traceId || null
    }
  })
}

export default errorHandler
