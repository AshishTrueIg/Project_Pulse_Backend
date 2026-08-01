import bcrypt from 'bcrypt'
import { StatusCodes } from 'http-status-codes'

import {
  AuditLog,
  sequelize,
  User,
  UserInvitation,
  UserRole
} from '@src/db/models'
import AppError from '@src/errors/app.error'
import BaseHandler from '@src/libs/baseHandler'

import { hashToken } from '../auth/authToken.service'
import {
  assertInvitationCanBeAccepted,
  getInvitationByToken,
  invitationAuditValue
} from './invitation.helpers'

class AcceptInvitationService extends BaseHandler {
  async run () {
    const tokenHash = hashToken(this.args.token)
    const initialInvitation = await getInvitationByToken(this.args.token)

    assertInvitationCanBeAccepted(initialInvitation)

    const passwordHash = await bcrypt.hash(this.args.password, 12)

    return sequelize.transaction(async transaction => {
      const invitation = await UserInvitation.findOne({
        where: {
          id: initialInvitation.id,
          tokenHash
        },
        lock: transaction.LOCK.UPDATE,
        transaction
      })

      assertInvitationCanBeAccepted(invitation)

      const existingUser = await User.findOne({
        where: {
          email: invitation.email
        },
        transaction
      })

      if (existingUser) {
        throw new AppError(
          'An account already exists for this email address',
          StatusCodes.CONFLICT,
          null,
          {
            code: 'USER_EMAIL_EXISTS'
          }
        )
      }

      const user = await User.create(
        {
          organizationId: invitation.organizationId,
          email: invitation.email,
          passwordHash,
          fullName: invitation.fullName,
          jobTitle: invitation.jobTitle,
          employmentStartDate:
            invitation.employmentStartDate || new Date(),
          managerUserId: invitation.managerUserId,
          status: 'active'
        },
        {
          transaction
        }
      )

      await UserRole.create(
        {
          userId: user.id,
          roleId: invitation.roleId,
          assignedAt: new Date()
        },
        {
          transaction
        }
      )

      const beforeValue = invitationAuditValue(invitation)
      const acceptedAt = new Date()

      await invitation.update(
        {
          acceptedUserId: user.id,
          acceptedAt,
          status: 'accepted'
        },
        {
          transaction
        }
      )

      await AuditLog.create(
        {
          organizationId: invitation.organizationId,
          actorUserId: user.id,
          action: 'invitation.accepted',
          entityType: 'user_invitation',
          entityId: invitation.id,
          beforeValue,
          afterValue: invitationAuditValue(invitation),
          metadata: {
            userId: user.id
          }
        },
        {
          transaction
        }
      )

      return {
        email: user.email,
        fullName: user.fullName,
        acceptedAt: acceptedAt.toISOString()
      }
    })
  }
}

export default AcceptInvitationService
