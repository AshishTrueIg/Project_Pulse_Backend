import { Op } from 'sequelize'

import { Project, ProjectAssignment } from '@src/db/models'
import GetProjectService from '@src/services/projects/getProject.service'

const context = {
  auth: {
    organizationId: 'organization-1',
    permissions: ['projects:read:assigned'],
    userId: 'user-1'
  },
  logger: {
    error: jest.fn(),
    info: jest.fn()
  },
  traceId: 'project-access-test'
}

describe('GetProjectService access scope', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('combines the assigned-project scope with the requested project ID', async () => {
    jest.spyOn(ProjectAssignment, 'findAll').mockResolvedValue([
      {
        projectId: 'assigned-project'
      }
    ])
    const findProject = jest.spyOn(Project, 'findOne').mockResolvedValue(null)

    await expect(
      GetProjectService.execute(
        {
          projectId: 'unassigned-project'
        },
        context
      )
    ).rejects.toEqual(
      expect.objectContaining({
        code: 'PROJECT_NOT_FOUND',
        statusCode: 404
      })
    )

    const query = findProject.mock.calls[0][0]
    const [scope, requestedProject] = query.where[Op.and]

    expect(scope.organizationId).toBe('organization-1')
    expect(scope.id[Op.in]).toEqual(['assigned-project'])
    expect(requestedProject).toEqual({
      id: 'unassigned-project'
    })
  })
})
