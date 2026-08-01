import { UserInvitation } from '@src/db/models'
import BaseHandler from '@src/libs/baseHandler'

import {
  getInvitationStatus,
  invitationIncludes,
  serializeInvitation
} from './invitation.helpers'

const DEFAULT_PAGE_SIZE = 20
const MAX_PAGE_SIZE = 100

class ListInvitationsService extends BaseHandler {
  async run () {
    const {
      limit = DEFAULT_PAGE_SIZE,
      page = 1,
      search,
      status
    } = this.args
    const parsedPage = Number(page)
    const parsedLimit = Math.min(Number(limit), MAX_PAGE_SIZE)
    const invitations = await UserInvitation.findAll({
      where: {
        organizationId: this.context.auth.organizationId
      },
      include: invitationIncludes,
      order: [['createdAt', 'DESC']],
      transaction: this.dbTransaction
    })
    const normalizedSearch = search?.trim().toLowerCase()
    const serialized = invitations.map(serializeInvitation)
    const filtered = serialized
      .filter(invitation => !status || invitation.status === status)
      .filter(invitation => {
        if (!normalizedSearch) return true

        return [
          invitation.fullName,
          invitation.email,
          invitation.jobTitle,
          invitation.role?.name,
          invitation.manager?.fullName,
          invitation.invitedBy?.fullName
        ]
          .filter(Boolean)
          .some(value => value.toLowerCase().includes(normalizedSearch))
      })
    const offset = (parsedPage - 1) * parsedLimit
    const statusCounts = invitations.reduce(
      (counts, invitation) => {
        const currentStatus = getInvitationStatus(invitation)

        counts[currentStatus] += 1

        return counts
      },
      {
        accepted: 0,
        expired: 0,
        pending: 0,
        revoked: 0
      }
    )

    return {
      items: filtered.slice(offset, offset + parsedLimit),
      pagination: {
        limit: parsedLimit,
        page: parsedPage,
        total: filtered.length,
        totalPages: Math.ceil(filtered.length / parsedLimit)
      },
      summary: {
        ...statusCounts,
        deliveryFailed: invitations.filter(
          invitation => invitation.deliveryStatus === 'failed'
        ).length,
        total: invitations.length
      }
    }
  }
}

export default ListInvitationsService
