import authorize from '@src/rest-resources/middlewares/authorize.middleware'

describe('authorize middleware', () => {
  it('allows a user with the required permission', () => {
    const next = jest.fn()
    const request = {
      auth: {
        permissions: ['dashboard:read']
      }
    }

    authorize('dashboard:read')(request, {}, next)

    expect(next).toHaveBeenCalledWith()
  })

  it('allows an owner wildcard permission', () => {
    const next = jest.fn()
    const request = {
      auth: {
        permissions: ['*']
      }
    }

    authorize('financials:write')(request, {}, next)

    expect(next).toHaveBeenCalledWith()
  })

  it('returns a forbidden error when the permission is missing', () => {
    const next = jest.fn()
    const request = {
      auth: {
        permissions: ['projects:read:assigned']
      }
    }

    authorize('financials:read')(request, {}, next)

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 403
      })
    )
  })
})
