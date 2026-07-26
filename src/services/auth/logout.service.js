import jwt from 'jsonwebtoken'

import config from '@src/configs/app.config'
import { RefreshSession } from '@src/db/models'

import { tokenHashesMatch } from './authToken.service'

const logout = async refreshToken => {
  if (!refreshToken) return

  let payload

  try {
    payload = jwt.verify(refreshToken, config.get('jwt.refreshSecret'))
  } catch (error) {
    return
  }

  if (payload.type !== 'refresh' || !payload.sessionId) return

  const session = await RefreshSession.findOne({
    where: {
      id: payload.sessionId,
      userId: payload.sub
    }
  })

  if (!session || session.revokedAt || !tokenHashesMatch(refreshToken, session.tokenHash)) return

  await session.update({
    revokedAt: new Date()
  })
}

export default logout
