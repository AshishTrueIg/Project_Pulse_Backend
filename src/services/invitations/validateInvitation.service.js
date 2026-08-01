import BaseHandler from '@src/libs/baseHandler'

import {
  assertInvitationCanBeAccepted,
  getInvitationByToken
} from './invitation.helpers'

class ValidateInvitationService extends BaseHandler {
  async run () {
    const invitation = await getInvitationByToken(this.args.token, {
      transaction: this.dbTransaction
    })

    assertInvitationCanBeAccepted(invitation)

    return {
      invitation: {
        email: invitation.email,
        fullName: invitation.fullName,
        jobTitle: invitation.jobTitle,
        employmentStartDate: invitation.employmentStartDate,
        expiresAt: invitation.expiresAt,
        organization: {
          id: invitation.organization.id,
          name: invitation.organization.name
        },
        role: {
          id: invitation.role.id,
          name: invitation.role.name
        },
        manager: invitation.manager
          ? {
              id: invitation.manager.id,
              fullName: invitation.manager.fullName,
              jobTitle: invitation.manager.jobTitle
            }
          : null
      }
    }
  }
}

export default ValidateInvitationService
