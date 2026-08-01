import { StatusCodes } from 'http-status-codes'

import { sequelize, UserInvitation } from '@src/db/models'
import AppError from '@src/errors/app.error'
import BaseHandler from '@src/libs/baseHandler'

import { writeAuditLog } from '../projects/projectMutation.helpers'
import {
  createInvitationToken,
  getInvitationExpiry,
  getInvitationStatus,
  invitationAuditValue,
  invitationIncludes,
  serializeInvitation
} from './invitation.helpers'
import { deliverInvitation } from './invitationEmail.service'

class ResendInvitationService extends BaseHandler {
  async run () {
    const auth = this.context.auth
    const { token, tokenHash } = createInvitationToken()

    await sequelize.transaction(async transaction => {
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
          'Only pending or expired invitations can be resent',
          StatusCodes.CONFLICT,
          null,
          {
            code: 'INVITATION_CANNOT_BE_RESENT'
          }
        )
      }

      const beforeValue = invitationAuditValue(invitation)

      await invitation.update(
        {
          tokenHash,
          expiresAt: getInvitationExpiry(),
          deliveryStatus: 'pending',
          deliveryError: null
        },
        {
          transaction
        }
      )

      await writeAuditLog(
        {
          action: 'invitation.resent',
          afterValue: invitationAuditValue(invitation),
          beforeValue,
          entityId: invitation.id,
          entityType: 'user_invitation'
        },
        auth,
        transaction
      )
    })

    const invitation = await UserInvitation.findByPk(
      this.args.invitationId,
      {
        include: invitationIncludes
      }
    )
    const delivery = await deliverInvitation(
      invitation,
      token,
      this.logger
    )

    return {
      invitation: serializeInvitation(invitation),
      delivery
    }
  }
}

export default ResendInvitationService
