import { StatusCodes } from 'http-status-codes'
import { Op } from 'sequelize'

import {
  Role,
  sequelize,
  User,
  UserInvitation
} from '@src/db/models'
import AppError from '@src/errors/app.error'
import BaseHandler from '@src/libs/baseHandler'

import { writeAuditLog } from '../projects/projectMutation.helpers'
import {
  ALLOWED_INVITATION_ROLES,
  createInvitationToken,
  getInvitationExpiry,
  invitationAuditValue,
  invitationIncludes,
  serializeInvitation
} from './invitation.helpers'
import { deliverInvitation } from './invitationEmail.service'

class CreateInvitationService extends BaseHandler {
  async run () {
    const auth = this.context.auth
    const email = this.args.email.trim().toLowerCase()
    const { token, tokenHash } = createInvitationToken()

    const invitationId = await sequelize.transaction(async transaction => {
      const [existingUser, pendingInvitation, role] = await Promise.all([
        User.findOne({
          where: {
            email
          },
          transaction
        }),
        UserInvitation.findOne({
          where: {
            organizationId: auth.organizationId,
            email,
            status: 'pending',
            expiresAt: {
              [Op.gt]: new Date()
            }
          },
          transaction
        }),
        Role.findOne({
          where: {
            id: this.args.roleId,
            organizationId: auth.organizationId
          },
          transaction
        })
      ])

      if (existingUser) {
        throw new AppError(
          'A user with this email already has an account',
          StatusCodes.CONFLICT,
          null,
          {
            code: 'USER_EMAIL_EXISTS'
          }
        )
      }

      if (pendingInvitation) {
        throw new AppError(
          'A pending invitation already exists for this email',
          StatusCodes.CONFLICT,
          null,
          {
            code: 'INVITATION_ALREADY_PENDING'
          }
        )
      }

      if (!role || !ALLOWED_INVITATION_ROLES.has(role.name)) {
        throw new AppError(
          'Select Manager, Team Lead or Employee as the access role',
          StatusCodes.UNPROCESSABLE_ENTITY,
          null,
          {
            code: 'INVALID_INVITATION_ROLE'
          }
        )
      }

      if (this.args.managerUserId) {
        const manager = await User.findOne({
          where: {
            id: this.args.managerUserId,
            organizationId: auth.organizationId,
            status: 'active'
          },
          transaction
        })

        if (!manager) {
          throw new AppError(
            'Select an active reporting manager from your company',
            StatusCodes.UNPROCESSABLE_ENTITY,
            null,
            {
              code: 'INVALID_INVITATION_MANAGER'
            }
          )
        }
      }

      const invitation = await UserInvitation.create(
        {
          organizationId: auth.organizationId,
          roleId: role.id,
          managerUserId: this.args.managerUserId || null,
          invitedByUserId: auth.userId,
          email,
          fullName: this.args.fullName.trim(),
          jobTitle: this.args.jobTitle?.trim() || null,
          employmentStartDate: this.args.employmentStartDate || null,
          tokenHash,
          status: 'pending',
          expiresAt: getInvitationExpiry(),
          deliveryStatus: 'pending'
        },
        {
          transaction
        }
      )

      await writeAuditLog(
        {
          action: 'invitation.created',
          afterValue: invitationAuditValue(invitation),
          entityId: invitation.id,
          entityType: 'user_invitation'
        },
        auth,
        transaction
      )

      return invitation.id
    })

    const invitation = await UserInvitation.findByPk(invitationId, {
      include: invitationIncludes
    })
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

export default CreateInvitationService
