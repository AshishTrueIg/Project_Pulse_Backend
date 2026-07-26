import jwt from 'jsonwebtoken'

import config from '@src/configs/app.config'
import { RefreshSession } from '@src/db/models'
import BaseHandler from '@src/libs/baseHandler'

import { tokenHashesMatch } from './authToken.service'

class LogoutService extends BaseHandler {
  async run () {
    const { refreshToken } = this.args

    if (!refreshToken) return null

    let payload

    try {
      payload = jwt.verify(refreshToken, config.get('jwt.refreshSecret'))
    } catch (error) {
      return null
    }

    if (payload.type !== 'refresh' || !payload.sessionId) return null

    const session = await RefreshSession.findOne({
      where: {
        id: payload.sessionId,
        userId: payload.sub
      },
      transaction: this.dbTransaction
    })

    if (
      !session ||
      session.revokedAt ||
      !tokenHashesMatch(refreshToken, session.tokenHash)
    ) {
      return null
    }

    await session.update(
      {
        revokedAt: new Date()
      },
      {
        transaction: this.dbTransaction
      }
    )

    return null
  }
}

export default LogoutService
