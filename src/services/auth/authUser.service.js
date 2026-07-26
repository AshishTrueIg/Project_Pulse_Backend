import { Organization, Role, User } from '@src/db/models'

const authUserInclude = [
  {
    model: Organization,
    as: 'organization'
  },
  {
    model: Role,
    as: 'roles',
    through: {
      attributes: []
    }
  }
]

const findAuthUser = (where, options = {}) =>
  User.findOne({
    where,
    include: authUserInclude,
    ...options
  })

const serializeAuthUser = user => ({
  id: user.id,
  organizationId: user.organizationId,
  email: user.email,
  fullName: user.fullName,
  jobTitle: user.jobTitle,
  status: user.status,
  roles: user.roles.map(role => role.name),
  permissions: [...new Set(user.roles.flatMap(role => role.permissions || []))],
  organization: {
    id: user.organization.id,
    name: user.organization.name,
    timezone: user.organization.timezone,
    currency: user.organization.currency
  }
})

export { findAuthUser, serializeAuthUser }
