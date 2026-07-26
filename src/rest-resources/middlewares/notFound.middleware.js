import { StatusCodes } from 'http-status-codes'

const notFoundHandler = (request, response) => {
  response.status(StatusCodes.NOT_FOUND).json({
    error: {
      message: `Route ${request.method} ${request.originalUrl} was not found`
    }
  })
}

export default notFoundHandler
