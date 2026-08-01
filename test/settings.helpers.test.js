import {
  getChangedFields,
  serializeActivity,
  serializeRole
} from '@src/services/settings/settings.helpers'

describe('settings helpers', () => {
  it('serializes role permissions into readable groups', () => {
    const result = serializeRole({
      id: 'role-1',
      isSystem: true,
      name: 'Manager',
      permissions: ['projects:write', 'settings:read'],
      users: [{ id: 'user-1' }, { id: 'user-2' }]
    })

    expect(result.userCount).toBe(2)
    expect(result.permissions).toEqual([
      {
        group: 'Projects',
        key: 'projects:write',
        label: 'Manage all projects'
      },
      {
        group: 'Administration',
        key: 'settings:read',
        label: 'View company settings'
      }
    ])
  })

  it('only exposes safe changed-field labels in activity', () => {
    const result = getChangedFields(
      {
        name: 'Before',
        passwordHash: 'secret',
        updatedAt: 'before'
      },
      {
        name: 'After',
        passwordHash: 'different',
        updatedAt: 'after'
      }
    )

    expect(result).toEqual([
      {
        key: 'name',
        label: 'Name'
      }
    ])
  })

  it('serializes an actor-aware activity event', () => {
    const result = serializeActivity({
      id: 'audit-1',
      action: 'project.updated',
      actor: {
        email: 'manager@example.com',
        fullName: 'Manager One',
        id: 'user-1'
      },
      afterValue: {
        name: 'Project One',
        stage: 'mvp_review'
      },
      beforeValue: {
        name: 'Project One',
        stage: 'active_development'
      },
      createdAt: new Date('2026-07-31T12:00:00.000Z'),
      entityId: 'project-1',
      entityType: 'project',
      metadata: null
    })

    expect(result.actionLabel).toBe('Project Updated')
    expect(result.description).toBe('updated Project One')
    expect(result.entity.label).toBe('Project One')
    expect(result.changedFields).toEqual([
      {
        key: 'stage',
        label: 'Stage'
      }
    ])
  })
})
