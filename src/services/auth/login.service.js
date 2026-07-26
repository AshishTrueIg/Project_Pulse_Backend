import bcrypt from 'bcrypt'
import { StatusCodes } from 'http-status-codes'

import { AuditLog } from '@src/db/models'
import AppError from '@src/errors/app.error'

import { findAuthUser, serializeAuthUser } from './authUser.service'
import { issueSessionTokens } from './authToken.service'

const login = async ({ email, password }, context) => {
  const user = await findAuthUser({
    email: email.trim().toLowerCase()
  })

  const passwordMatches = user ? await bcrypt.compare(password, user.passwordHash) : false

  if (!user || !passwordMatches || user.status !== 'active') {
    throw new AppError('Email or password is incorrect', StatusCodes.UNAUTHORIZED)
  }

  const tokens = await issueSessionTokens(user, context)
  const loginTime = new Date()

  await Promise.all([
    user.update({
      lastLoginAt: loginTime
    }),
    AuditLog.create({
      organizationId: user.organizationId,
      actorUserId: user.id,
      action: 'auth.login',
      entityType: 'user',
      entityId: user.id,
      afterValue: {
        loggedInAt: loginTime.toISOString()
      },
      metadata: {
        ipAddress: context.ipAddress || null
      }
    })
  ])

  return {
    ...tokens,
    user: serializeAuthUser(user)
  }
}

export default login
