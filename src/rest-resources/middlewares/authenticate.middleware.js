import { StatusCodes } from 'http-status-codes'
import jwt from 'jsonwebtoken'

import config from '@src/configs/app.config'
import { Organization, Role, User } from '@src/db/models'
import AppError from '@src/errors/app.error'

const getBearerToken = authorizationHeader => {
  if (!authorizationHeader?.startsWith('Bearer ')) return null

  return authorizationHeader.slice(7).trim()
}

const authenticate = async (request, response, next) => {
  const accessToken = getBearerToken(request.headers.authorization)

  if (!accessToken) {
    return next(new AppError('Authentication is required', StatusCodes.UNAUTHORIZED))
  }

  let payload

  try {
    payload = jwt.verify(accessToken, config.get('jwt.accessSecret'))
  } catch (error) {
    return next(new AppError('The access token is invalid or expired', StatusCodes.UNAUTHORIZED))
  }

  if (payload.type !== 'access') {
    return next(new AppError('The access token is invalid', StatusCodes.UNAUTHORIZED))
  }

  const user = await User.findOne({
    where: {
      id: payload.sub,
      status: 'active'
    },
    attributes: {
      exclude: ['passwordHash']
    },
    include: [
      {
        model: Organization,
        as: 'organization'
      },
      {
        model: Role,
        as: 'roles',
        through: {
          attributes: []
        }
      }
    ]
  })

  if (!user) {
    return next(new AppError('This account is no longer active', StatusCodes.UNAUTHORIZED))
  }

  const roles = user.roles.map(role => role.name)
  const permissions = [...new Set(user.roles.flatMap(role => role.permissions || []))]

  request.currentUser = user
  request.auth = {
    userId: user.id,
    organizationId: user.organizationId,
    roles,
    permissions
  }
  request.context.auth = request.auth
  request.context.currentUser = user

  next()
}

export default authenticate
