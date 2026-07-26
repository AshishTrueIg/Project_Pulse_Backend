import { createHash, randomUUID, timingSafeEqual } from 'crypto'
import jwt from 'jsonwebtoken'

import config from '@src/configs/app.config'
import { RefreshSession } from '@src/db/models'

const hashToken = token => createHash('sha256').update(token).digest('hex')

const tokenHashesMatch = (token, expectedHash) => {
  const actual = Buffer.from(hashToken(token))
  const expected = Buffer.from(expectedHash)

  return actual.length === expected.length && timingSafeEqual(actual, expected)
}

const createAccessToken = user =>
  jwt.sign(
    {
      organizationId: user.organizationId,
      type: 'access'
    },
    config.get('jwt.accessSecret'),
    {
      subject: user.id,
      expiresIn: config.get('jwt.accessExpiresIn')
    }
  )

const createRefreshToken = (user, sessionId) =>
  jwt.sign(
    {
      sessionId,
      type: 'refresh'
    },
    config.get('jwt.refreshSecret'),
    {
      subject: user.id,
      expiresIn: config.get('jwt.refreshExpiresIn')
    }
  )

const issueSessionTokens = async (user, context, transaction) => {
  const sessionId = randomUUID()
  const refreshToken = createRefreshToken(user, sessionId)
  const refreshPayload = jwt.decode(refreshToken)

  await RefreshSession.create(
    {
      id: sessionId,
      userId: user.id,
      tokenHash: hashToken(refreshToken),
      userAgent: context.userAgent || null,
      ipAddress: context.ipAddress || null,
      expiresAt: new Date(refreshPayload.exp * 1000)
    },
    {
      transaction
    }
  )

  return {
    accessToken: createAccessToken(user),
    refreshToken
  }
}

export { hashToken, issueSessionTokens, tokenHashesMatch }
