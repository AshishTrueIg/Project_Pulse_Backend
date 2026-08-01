import bcrypt from 'bcrypt'

import {
  AuditLog,
  sequelize,
  User,
  UserInvitation,
  UserRole
} from '@src/db/models'
import AcceptInvitationService from '@src/services/invitations/acceptInvitation.service'
import {
  assertInvitationCanBeAccepted,
  getInvitationByToken,
  invitationAuditValue
} from '@src/services/invitations/invitation.helpers'

jest.mock('bcrypt', () => ({
  hash: jest.fn()
}))

jest.mock('@src/db/models', () => ({
  AuditLog: {
    create: jest.fn()
  },
  sequelize: {
    transaction: jest.fn()
  },
  User: {
    create: jest.fn(),
    findOne: jest.fn()
  },
  UserInvitation: {
    findOne: jest.fn()
  },
  UserRole: {
    create: jest.fn()
  }
}))

jest.mock('@src/services/invitations/invitation.helpers', () => ({
  assertInvitationCanBeAccepted: jest.fn(),
  getInvitationByToken: jest.fn(),
  invitationAuditValue: jest.fn(invitation => ({
    id: invitation.id,
    status: invitation.status
  }))
}))

const context = {
  logger: {
    error: jest.fn(),
    info: jest.fn()
  },
  traceId: 'accept-invitation-test'
}

describe('AcceptInvitationService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    sequelize.transaction.mockImplementation(handler =>
      handler({
        LOCK: {
          UPDATE: 'UPDATE'
        }
      })
    )
  })

  it('creates an active user, assigns the invited role and consumes the link', async () => {
    const initialInvitation = {
      id: 'invitation-1'
    }
    const invitation = {
      id: 'invitation-1',
      acceptedUserId: null,
      email: 'new.person@example.com',
      employmentStartDate: '2026-08-01',
      fullName: 'New Person',
      jobTitle: 'Engineer',
      managerUserId: 'manager-1',
      organizationId: 'organization-1',
      roleId: 'role-1',
      status: 'pending',
      update: jest.fn().mockImplementation(async values => {
        Object.assign(invitation, values)
      })
    }
    const user = {
      id: 'user-new',
      email: invitation.email,
      fullName: invitation.fullName
    }

    getInvitationByToken.mockResolvedValue(initialInvitation)
    bcrypt.hash.mockResolvedValue('secure-password-hash')
    UserInvitation.findOne.mockResolvedValue(invitation)
    User.findOne.mockResolvedValue(null)
    User.create.mockResolvedValue(user)
    UserRole.create.mockResolvedValue(undefined)
    AuditLog.create.mockResolvedValue(undefined)

    const result = await AcceptInvitationService.execute(
      {
        password: 'Strong$123',
        token: 'a'.repeat(64)
      },
      context
    )

    expect(assertInvitationCanBeAccepted).toHaveBeenCalledTimes(2)
    expect(bcrypt.hash).toHaveBeenCalledWith('Strong$123', 12)
    expect(User.create).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'new.person@example.com',
        passwordHash: 'secure-password-hash',
        status: 'active'
      }),
      expect.objectContaining({
        transaction: expect.any(Object)
      })
    )
    expect(UserRole.create).toHaveBeenCalledWith(
      expect.objectContaining({
        roleId: 'role-1',
        userId: 'user-new'
      }),
      expect.any(Object)
    )
    expect(invitation.update).toHaveBeenCalledWith(
      expect.objectContaining({
        acceptedUserId: 'user-new',
        status: 'accepted'
      }),
      expect.any(Object)
    )
    expect(invitationAuditValue).toHaveBeenCalled()
    expect(AuditLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'invitation.accepted',
        actorUserId: 'user-new',
        entityId: 'invitation-1'
      }),
      expect.any(Object)
    )
    expect(result).toEqual(
      expect.objectContaining({
        email: 'new.person@example.com',
        fullName: 'New Person'
      })
    )
  })
})
