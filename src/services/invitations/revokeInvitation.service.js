import { StatusCodes } from 'http-status-codes'

import { sequelize, UserInvitation } from '@src/db/models'
import AppError from '@src/errors/app.error'
import BaseHandler from '@src/libs/baseHandler'

import { writeAuditLog } from '../projects/projectMutation.helpers'
import {
  getInvitationStatus,
  invitationAuditValue
} from './invitation.helpers'

class RevokeInvitationService extends BaseHandler {
  async run () {
    const auth = this.context.auth

    return sequelize.transaction(async transaction => {
      const invitation = await UserInvitation.findOne({
        where: {
          id: this.args.invitationId,
          organizationId: auth.organizationId
        },
        lock: transaction.LOCK.UPDATE,
        transaction
      })

      if (!invitation) {
        throw new AppError(
          'Invitation was not found',
          StatusCodes.NOT_FOUND,
          null,
          {
            code: 'INVITATION_NOT_FOUND'
          }
        )
      }

      if (!['pending', 'expired'].includes(getInvitationStatus(invitation))) {
        throw new AppError(
          'Only pending or expired invitations can be revoked',
          StatusCodes.CONFLICT,
          null,
          {
            code: 'INVITATION_CANNOT_BE_REVOKED'
          }
        )
      }

      const beforeValue = invitationAuditValue(invitation)

      await invitation.update(
        {
          status: 'revoked',
          revokedAt: new Date()
        },
        {
          transaction
        }
      )

      await writeAuditLog(
        {
          action: 'invitation.revoked',
          afterValue: invitationAuditValue(invitation),
          beforeValue,
          entityId: invitation.id,
          entityType: 'user_invitation'
        },
        auth,
        transaction
      )

      return {
        id: invitation.id,
        status: 'revoked'
      }
    })
  }
}

export default RevokeInvitationService
