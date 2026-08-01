const ids = {
  organization: '10000000-0000-4000-8000-000000000001',
  roles: {
    owner: '20000000-0000-4000-8000-000000000001',
    manager: '20000000-0000-4000-8000-000000000002',
    teamLead: '20000000-0000-4000-8000-000000000003',
    employee: '20000000-0000-4000-8000-000000000004'
  }
}

const withTimestamps = (row, now) => ({
  ...row,
  created_at: now,
  updated_at: now
})

export const up = async queryInterface => {
  const [organizations] = await queryInterface.sequelize.query(
    'SELECT id FROM organizations WHERE id = :organizationId LIMIT 1',
    {
      replacements: {
        organizationId: ids.organization
      }
    }
  )

  if (organizations.length > 0) return

  const now = new Date()

  await queryInterface.bulkInsert('organizations', [
    withTimestamps({
      id: ids.organization,
      name: 'My Company',
      slug: 'my-company',
      timezone: 'Asia/Kolkata',
      currency: 'INR',
      reporting_cadence_days: 7
    }, now)
  ])

  await queryInterface.bulkInsert('roles', [
    withTimestamps({
      id: ids.roles.owner,
      organization_id: ids.organization,
      name: 'owner',
      permissions: JSON.stringify(['*']),
      is_system: true
    }, now),
    withTimestamps({
      id: ids.roles.manager,
      organization_id: ids.organization,
      name: 'manager',
      permissions: JSON.stringify([
        'dashboard:read',
        'projects:read',
        'projects:write',
        'people:read',
        'people:write',
        'feedback:write',
        'financials:read',
        'financials:write',
        'settings:read',
        'settings:write',
        'audit:read'
      ]),
      is_system: true
    }, now),
    withTimestamps({
      id: ids.roles.teamLead,
      organization_id: ids.organization,
      name: 'team_lead',
      permissions: JSON.stringify([
        'dashboard:read:assigned',
        'projects:read:assigned',
        'projects:update:assigned',
        'people:read:assigned',
        'feedback:write:assigned'
      ]),
      is_system: true
    }, now),
    withTimestamps({
      id: ids.roles.employee,
      organization_id: ids.organization,
      name: 'employee',
      permissions: JSON.stringify([
        'dashboard:read:own',
        'projects:read:assigned',
        'people:read:self',
        'feedback:read:own'
      ]),
      is_system: true
    }, now)
  ])
}

export const down = async queryInterface => {
  const [users] = await queryInterface.sequelize.query(
    'SELECT id FROM users WHERE organization_id = :organizationId LIMIT 1',
    {
      replacements: {
        organizationId: ids.organization
      }
    }
  )

  if (users.length > 0) {
    throw new Error('Remove organization users before undoing the bootstrap seeder')
  }

  await queryInterface.bulkDelete('roles', {
    organization_id: ids.organization
  })
  await queryInterface.bulkDelete('organizations', {
    id: ids.organization
  })
}
