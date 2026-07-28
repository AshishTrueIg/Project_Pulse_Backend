import { ProjectHealthUpdate, sequelize } from '@src/db/models'
import CreateProjectHealthUpdateService from '@src/services/projects/createProjectHealthUpdate.service'
import {
  getProjectForWrite,
  writeAuditLog
} from '@src/services/projects/projectMutation.helpers'

jest.mock('@src/db/models', () => ({
  ProjectHealthUpdate: {
    create: jest.fn()
  },
  sequelize: {
    transaction: jest.fn()
  }
}))

jest.mock('@src/services/projects/projectMutation.helpers', () => ({
  getProjectForWrite: jest.fn(),
  writeAuditLog: jest.fn()
}))

const context = {
  auth: {
    organizationId: 'organization-1',
    permissions: ['projects:write'],
    userId: 'manager-1'
  },
  logger: {
    error: jest.fn(),
    info: jest.fn()
  },
  traceId: 'health-update-test'
}

describe('CreateProjectHealthUpdateService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    sequelize.transaction.mockImplementation(handler => handler('transaction'))
  })

  it('persists the update and refreshes health recency even when health is unchanged', async () => {
    const project = {
      overallHealth: 'green',
      update: jest.fn().mockResolvedValue(undefined)
    }
    const healthUpdate = {
      id: 'health-update-1',
      toJSON: jest.fn().mockReturnValue({
        id: 'health-update-1',
        health: 'green'
      })
    }

    getProjectForWrite.mockResolvedValue(project)
    ProjectHealthUpdate.create.mockResolvedValue(healthUpdate)
    writeAuditLog.mockResolvedValue(undefined)

    const result = await CreateProjectHealthUpdateService.execute(
      {
        accomplishments: 'Completed the planned outcomes.',
        blockers: '',
        health: 'green',
        nextSteps: 'Continue delivery.',
        projectId: 'project-1',
        summary: 'Delivery remains on track.'
      },
      context
    )

    expect(ProjectHealthUpdate.create).toHaveBeenCalledWith(
      expect.objectContaining({
        accomplishments: 'Completed the planned outcomes.',
        blockers: null,
        health: 'green',
        organizationId: 'organization-1',
        projectId: 'project-1',
        submittedByUserId: 'manager-1',
        summary: 'Delivery remains on track.'
      }),
      {
        transaction: 'transaction'
      }
    )
    expect(project.update).toHaveBeenCalledWith(
      {
        overallHealth: 'green',
        lastHealthUpdatedAt: expect.any(Date)
      },
      {
        transaction: 'transaction'
      }
    )
    expect(writeAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'project.health_update_submitted',
        entityId: 'health-update-1',
        entityType: 'project_health_update'
      }),
      context.auth,
      'transaction'
    )
    expect(result).toEqual(
      expect.objectContaining({
        id: 'health-update-1',
        projectId: 'project-1',
        submittedAt: expect.any(String)
      })
    )
  })
})
