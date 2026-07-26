import { StatusCodes } from 'http-status-codes'

import AppError from '@src/errors/app.error'

const authorize = (...requiredPermissions) => (request, response, next) => {
  const permissions = request.auth?.permissions || []
  const allowed =
    permissions.includes('*') ||
    requiredPermissions.some(permission => permissions.includes(permission))

  if (!allowed) {
    return next(
      new AppError(
        'You do not have permission to perform this action',
        StatusCodes.FORBIDDEN
      )
    )
  }

  next()
}

export default authorize
