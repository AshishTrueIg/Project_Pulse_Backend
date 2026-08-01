import { randomBytes } from 'crypto'
import { StatusCodes } from 'http-status-codes'

import config from '@src/configs/app.config'
import {
  Organization,
  Role,
  User,
  UserInvitation
} from '@src/db/models'
import AppError from '@src/errors/app.error'

import { hashToken } from '../auth/authToken.service'

const ALLOWED_INVITATION_ROLES = new Set([
  'manager',
  'team_lead',
  'employee'
])

const invitationIncludes = [
  {
    model: Organization,
    as: 'organization',
    attributes: ['id', 'name']
  },
  {
    model: Role,
    as: 'role',
    attributes: ['id', 'name']
  },
  {
    model: User,
    as: 'manager',
    attributes: ['id', 'fullName', 'email', 'jobTitle'],
    required: false
  },
  {
    model: User,
    as: 'invitedBy',
    attributes: ['id', 'fullName', 'email'],
    required: false
  }
]

const createInvitationToken = () => {
  const token = randomBytes(32).toString('hex')

  return {
    token,
    tokenHash: hashToken(token)
  }
}

const getInvitationExpiry = () =>
  new Date(
    Date.now() +
      Number(config.get('invitation.expiresHours')) * 60 * 60 * 1000
  )

const getInvitationStatus = (invitation, now = new Date()) => {
  if (invitation.status === 'accepted') return 'accepted'
  if (invitation.status === 'revoked') return 'revoked'
  if (new Date(invitation.expiresAt) <= now) return 'expired'

  return 'pending'
}

const assertInvitationCanBeAccepted = invitation => {
  if (!invitation) {
    throw new AppError(
      'This invitation link is invalid',
      StatusCodes.NOT_FOUND,
      null,
      {
        code: 'INVITATION_INVALID'
      }
    )
  }

  const status = getInvitationStatus(invitation)

  if (status === 'accepted') {
    throw new AppError(
      'This invitation has already been accepted',
      StatusCodes.CONFLICT,
      null,
      {
        code: 'INVITATION_ALREADY_ACCEPTED'
      }
    )
  }

  if (status === 'revoked') {
    throw new AppError(
      'This invitation was revoked by a manager',
      StatusCodes.GONE,
      null,
      {
        code: 'INVITATION_REVOKED'
      }
    )
  }

  if (status === 'expired') {
    throw new AppError(
      'This invitation link has expired',
      StatusCodes.GONE,
      null,
      {
        code: 'INVITATION_EXPIRED'
      }
    )
  }
}

const serializeInvitation = invitation => {
  const status = getInvitationStatus(invitation)

  return {
    id: invitation.id,
    email: invitation.email,
    fullName: invitation.fullName,
    jobTitle: invitation.jobTitle,
    employmentStartDate: invitation.employmentStartDate,
    role: invitation.role
      ? {
          id: invitation.role.id,
          name: invitation.role.name
        }
      : null,
    manager: invitation.manager
      ? {
          id: invitation.manager.id,
          fullName: invitation.manager.fullName,
          email: invitation.manager.email,
          jobTitle: invitation.manager.jobTitle
        }
      : null,
    invitedBy: invitation.invitedBy
      ? {
          id: invitation.invitedBy.id,
          fullName: invitation.invitedBy.fullName,
          email: invitation.invitedBy.email
        }
      : null,
    status,
    expiresAt: invitation.expiresAt,
    acceptedAt: invitation.acceptedAt,
    revokedAt: invitation.revokedAt,
    lastSentAt: invitation.lastSentAt,
    delivery: {
      status: invitation.deliveryStatus,
      error: invitation.deliveryError
    },
    canResend: ['pending', 'expired'].includes(status),
    canRevoke: ['pending', 'expired'].includes(status),
    createdAt: invitation.createdAt,
    updatedAt: invitation.updatedAt
  }
}

const getInvitationByToken = (token, options = {}) =>
  UserInvitation.findOne({
    where: {
      tokenHash: hashToken(token)
    },
    include: invitationIncludes,
    ...options
  })

const invitationAuditValue = invitation => ({
  id: invitation.id,
  email: invitation.email,
  fullName: invitation.fullName,
  jobTitle: invitation.jobTitle,
  employmentStartDate: invitation.employmentStartDate,
  roleId: invitation.roleId,
  managerUserId: invitation.managerUserId,
  invitedByUserId: invitation.invitedByUserId,
  acceptedUserId: invitation.acceptedUserId,
  status: invitation.status,
  expiresAt: invitation.expiresAt,
  acceptedAt: invitation.acceptedAt,
  revokedAt: invitation.revokedAt,
  lastSentAt: invitation.lastSentAt,
  deliveryStatus: invitation.deliveryStatus
})

export {
  ALLOWED_INVITATION_ROLES,
  assertInvitationCanBeAccepted,
  createInvitationToken,
  getInvitationByToken,
  getInvitationExpiry,
  getInvitationStatus,
  invitationAuditValue,
  invitationIncludes,
  serializeInvitation
}
