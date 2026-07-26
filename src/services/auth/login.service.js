import bcrypt from 'bcrypt'
import { StatusCodes } from 'http-status-codes'

import { AuditLog, sequelize } from '@src/db/models'
import AppError from '@src/errors/app.error'
import BaseHandler from '@src/libs/baseHandler'

import { findAuthUser, serializeAuthUser } from './authUser.service'
import { issueSessionTokens } from './authToken.service'

class LoginService extends BaseHandler {
  async run () {
    const { email, password } = this.args
    const requestContext = this.context.request || {}

    return sequelize.transaction(async transaction => {
      const user = await findAuthUser(
        {
          email: email.trim().toLowerCase()
        },
        {
          transaction
        }
      )

      const passwordMatches = user
        ? await bcrypt.compare(password, user.passwordHash)
        : false

      if (!user || !passwordMatches || user.status !== 'active') {
        throw new AppError(
          'Email or password is incorrect',
          StatusCodes.UNAUTHORIZED,
          null,
          {
            code: 'INVALID_CREDENTIALS'
          }
        )
      }

      const tokens = await issueSessionTokens(user, this.context, transaction)
      const loginTime = new Date()

      await Promise.all([
        user.update(
          {
            lastLoginAt: loginTime
          },
          {
            transaction
          }
        ),
        AuditLog.create(
          {
            organizationId: user.organizationId,
            actorUserId: user.id,
            action: 'auth.login',
            entityType: 'user',
            entityId: user.id,
            afterValue: {
              loggedInAt: loginTime.toISOString()
            },
            metadata: {
              ipAddress: requestContext.ipAddress || null
            }
          },
          {
            transaction
          }
        )
      ])

      return {
        ...tokens,
        user: serializeAuthUser(user)
      }
    })
  }
}

export default LoginService
