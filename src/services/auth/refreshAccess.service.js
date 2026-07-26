import { StatusCodes } from 'http-status-codes'
import jwt from 'jsonwebtoken'

import config from '@src/configs/app.config'
import { RefreshSession, sequelize } from '@src/db/models'
import AppError from '@src/errors/app.error'

import { issueSessionTokens, tokenHashesMatch } from './authToken.service'
import { findAuthUser, serializeAuthUser } from './authUser.service'

const refreshAccess = async (refreshToken, context) => {
  let payload

  try {
    payload = jwt.verify(refreshToken, config.get('jwt.refreshSecret'))
  } catch (error) {
    throw new AppError('The refresh session is invalid or expired', StatusCodes.UNAUTHORIZED)
  }

  if (payload.type !== 'refresh' || !payload.sessionId) {
    throw new AppError('The refresh session is invalid', StatusCodes.UNAUTHORIZED)
  }

  return sequelize.transaction(async transaction => {
    const session = await RefreshSession.findOne({
      where: {
        id: payload.sessionId,
        userId: payload.sub
      },
      transaction,
      lock: transaction.LOCK.UPDATE
    })

    const isUsable =
      session &&
      !session.revokedAt &&
      session.expiresAt > new Date() &&
      tokenHashesMatch(refreshToken, session.tokenHash)

    if (!isUsable) {
      throw new AppError('The refresh session is no longer active', StatusCodes.UNAUTHORIZED)
    }

    const user = await findAuthUser({
      id: payload.sub,
      status: 'active'
    })

    if (!user) {
      throw new AppError('This account is no longer active', StatusCodes.UNAUTHORIZED)
    }

    await session.update(
      {
        revokedAt: new Date()
      },
      {
        transaction
      }
    )

    const tokens = await issueSessionTokens(user, context, transaction)

    return {
      ...tokens,
      user: serializeAuthUser(user)
    }
  })
}

export default refreshAccess
