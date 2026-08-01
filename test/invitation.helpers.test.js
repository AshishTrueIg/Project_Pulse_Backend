import {
  assertInvitationCanBeAccepted,
  createInvitationToken,
  getInvitationStatus,
  serializeInvitation
} from '@src/services/invitations/invitation.helpers'

describe('invitation helpers', () => {
  it('creates a high-entropy token and stores a different fixed-length hash', () => {
    const result = createInvitationToken()

    expect(result.token).toMatch(/^[a-f0-9]{64}$/)
    expect(result.tokenHash).toMatch(/^[a-f0-9]{64}$/)
    expect(result.tokenHash).not.toBe(result.token)
  })

  it('derives expired status without mutating the stored invitation', () => {
    const invitation = {
      expiresAt: new Date('2026-07-30T00:00:00.000Z'),
      status: 'pending'
    }

    expect(
      getInvitationStatus(
        invitation,
        new Date('2026-07-31T00:00:00.000Z')
      )
    ).toBe('expired')
    expect(invitation.status).toBe('pending')
  })

  it('never exposes the token hash in serialized management data', () => {
    const result = serializeInvitation({
      acceptedAt: null,
      createdAt: new Date('2026-07-31T00:00:00.000Z'),
      deliveryError: null,
      deliveryStatus: 'sent',
      email: 'new.person@example.com',
      employmentStartDate: '2026-08-01',
      expiresAt: new Date('2099-08-02T00:00:00.000Z'),
      fullName: 'New Person',
      id: 'invitation-1',
      invitedBy: null,
      jobTitle: 'Engineer',
      lastSentAt: new Date('2026-07-31T00:00:00.000Z'),
      manager: null,
      revokedAt: null,
      role: {
        id: 'role-1',
        name: 'employee'
      },
      status: 'pending',
      tokenHash: 'must-never-leave-the-api',
      updatedAt: new Date('2026-07-31T00:00:00.000Z')
    })

    expect(result).not.toHaveProperty('tokenHash')
    expect(result.status).toBe('pending')
    expect(result.canResend).toBe(true)
    expect(result.canRevoke).toBe(true)
  })

  it.each([
    ['accepted', 'INVITATION_ALREADY_ACCEPTED'],
    ['revoked', 'INVITATION_REVOKED']
  ])('rejects an invitation in %s state', (status, code) => {
    expect(() =>
      assertInvitationCanBeAccepted({
        expiresAt: new Date('2099-08-02T00:00:00.000Z'),
        status
      })
    ).toThrow(expect.objectContaining({ code }))
  })
})
