class AppError extends Error {
  constructor (message, statusCode = 500, details = null, options = {}) {
    super(message, {
      cause: options.cause
    })
    this.name = 'AppError'
    this.code = options.code || 'APPLICATION_ERROR'
    this.statusCode = statusCode
    this.details = details
  }
}

export default AppError
