import { StatusCodes } from 'http-status-codes'
import jwt from 'jsonwebtoken'

import config from '@src/configs/app.config'
import { RefreshSession, sequelize } from '@src/db/models'
import AppError from '@src/errors/app.error'
import BaseHandler from '@src/libs/baseHandler'

import { issueSessionTokens, tokenHashesMatch } from './authToken.service'
import { findAuthUser, serializeAuthUser } from './authUser.service'

class RefreshAccessService extends BaseHandler {
  async run () {
    const { refreshToken } = this.args
    let payload

    try {
      payload = jwt.verify(refreshToken, config.get('jwt.refreshSecret'))
    } catch (error) {
      throw new AppError(
        'The refresh session is invalid or expired',
        StatusCodes.UNAUTHORIZED,
        null,
        {
          code: 'INVALID_REFRESH_SESSION'
        }
      )
    }

    if (payload.type !== 'refresh' || !payload.sessionId) {
      throw new AppError(
        'The refresh session is invalid',
        StatusCodes.UNAUTHORIZED,
        null,
        {
          code: 'INVALID_REFRESH_SESSION'
        }
      )
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
        throw new AppError(
          'The refresh session is no longer active',
          StatusCodes.UNAUTHORIZED,
          null,
          {
            code: 'INACTIVE_REFRESH_SESSION'
          }
        )
      }

      const user = await findAuthUser(
        {
          id: payload.sub,
          status: 'active'
        },
        {
          transaction
        }
      )

      if (!user) {
        throw new AppError(
          'This account is no longer active',
          StatusCodes.UNAUTHORIZED,
          null,
          {
            code: 'INACTIVE_ACCOUNT'
          }
        )
      }

      await session.update(
        {
          revokedAt: new Date()
        },
        {
          transaction
        }
      )

      const tokens = await issueSessionTokens(user, this.context, transaction)

      return {
        ...tokens,
        user: serializeAuthUser(user)
      }
    })
  }
}

export default RefreshAccessService
