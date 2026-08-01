const PERMISSION_CATALOG = {
  '*': {
    group: 'Administration',
    label: 'Full workspace access'
  },
  'audit:read': {
    group: 'Administration',
    label: 'View activity log'
  },
  'dashboard:read': {
    group: 'Workspace',
    label: 'View overview'
  },
  'feedback:read': {
    group: 'Feedback',
    label: 'View feedback'
  },
  'feedback:write': {
    group: 'Feedback',
    label: 'Manage feedback'
  },
  'financials:read': {
    group: 'Financials',
    label: 'View financials'
  },
  'financials:write': {
    group: 'Financials',
    label: 'Manage financials'
  },
  'people:read': {
    group: 'People',
    label: 'View people'
  },
  'people:read:self': {
    group: 'People',
    label: 'View own profile'
  },
  'people:write': {
    group: 'People',
    label: 'Manage people'
  },
  'projects:read': {
    group: 'Projects',
    label: 'View all projects'
  },
  'projects:read:assigned': {
    group: 'Projects',
    label: 'View assigned projects'
  },
  'projects:update:assigned': {
    group: 'Projects',
    label: 'Update assigned projects'
  },
  'projects:write': {
    group: 'Projects',
    label: 'Manage all projects'
  },
  'settings:read': {
    group: 'Administration',
    label: 'View company settings'
  },
  'settings:write': {
    group: 'Administration',
    label: 'Manage company settings'
  }
}

const humanize = value =>
  value
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[.:_-]+/g, ' ')
    .replace(/\b\w/g, character => character.toUpperCase())

const serializePermission = permission => ({
  key: permission,
  group: PERMISSION_CATALOG[permission]?.group || 'Other',
  label: PERMISSION_CATALOG[permission]?.label || humanize(permission)
})

const serializeRole = role => ({
  id: role.id,
  name: role.name,
  isSystem: role.isSystem,
  userCount: role.users?.length || 0,
  permissions: (role.permissions || []).map(serializePermission)
})

const ignoredAuditFields = new Set([
  'createdAt',
  'updatedAt',
  'passwordHash'
])

const getChangedFields = (beforeValue, afterValue) => {
  const before = beforeValue || {}
  const after = afterValue || {}

  return [...new Set([...Object.keys(before), ...Object.keys(after)])]
    .filter(field => !ignoredAuditFields.has(field))
    .filter(
      field =>
        JSON.stringify(before[field] ?? null) !==
        JSON.stringify(after[field] ?? null)
    )
    .map(field => ({
      key: field,
      label: humanize(field)
    }))
}

const getEntityLabel = auditLog => {
  const value = auditLog.afterValue || auditLog.beforeValue || {}

  return (
    value.name ||
    value.title ||
    value.fullName ||
    value.code ||
    humanize(auditLog.entityType)
  )
}

const getActivityDescription = auditLog => {
  const specialDescriptions = {
    'auth.login': 'signed in',
    'organization.health_policy_updated':
      'updated the project health policy',
    'organization.settings_updated': 'updated company settings',
    'project.health_update_submitted':
      'submitted a project health update'
  }

  if (specialDescriptions[auditLog.action]) {
    return specialDescriptions[auditLog.action]
  }

  const action = auditLog.action.split('.').slice(1).join(' ') ||
    auditLog.action

  return `${humanize(action).toLowerCase()} ${getEntityLabel(auditLog)}`
}

const serializeActivity = auditLog => ({
  id: auditLog.id,
  action: auditLog.action,
  actionLabel: humanize(auditLog.action),
  description: getActivityDescription(auditLog),
  actor: auditLog.actor
    ? {
        id: auditLog.actor.id,
        fullName: auditLog.actor.fullName,
        email: auditLog.actor.email
      }
    : null,
  entity: {
    id: auditLog.entityId,
    type: auditLog.entityType,
    label: getEntityLabel(auditLog)
  },
  changedFields: getChangedFields(
    auditLog.beforeValue,
    auditLog.afterValue
  ),
  metadata: auditLog.metadata || null,
  createdAt: auditLog.createdAt
})

export {
  getChangedFields,
  serializeActivity,
  serializePermission,
  serializeRole
}
