import { StatusCodes } from 'http-status-codes'

import AppError from '@src/errors/app.error'

const notFoundHandler = (request, response, next) => {
  next(
    new AppError(
      `Route ${request.method} ${request.originalUrl} was not found`,
      StatusCodes.NOT_FOUND,
      null,
      {
        code: 'ROUTE_NOT_FOUND'
      }
    )
  )
}

export default notFoundHandler
