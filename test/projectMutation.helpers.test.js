import { Project, ProjectAssignment } from '@src/db/models'
import { getProjectForWrite } from '@src/services/projects/projectMutation.helpers'

describe('project mutation scope', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('allows a full project writer to load an organization project', async () => {
    const expectedProject = {
      id: 'project-1'
    }
    const findProject = jest
      .spyOn(Project, 'findOne')
      .mockResolvedValue(expectedProject)

    await expect(
      getProjectForWrite(
        'project-1',
        {
          organizationId: 'organization-1',
          permissions: ['projects:write'],
          userId: 'manager-1'
        },
        null
      )
    ).resolves.toBe(expectedProject)

    expect(findProject).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          id: 'project-1',
          organizationId: 'organization-1'
        }
      })
    )
  })

  it('hides an unassigned project from an assigned-only writer', async () => {
    jest.spyOn(ProjectAssignment, 'findAll').mockResolvedValue([
      {
        projectId: 'assigned-project'
      }
    ])
    const findProject = jest.spyOn(Project, 'findOne')

    await expect(
      getProjectForWrite(
        'unassigned-project',
        {
          organizationId: 'organization-1',
          permissions: ['projects:update:assigned'],
          userId: 'team-lead-1'
        },
        null
      )
    ).rejects.toEqual(
      expect.objectContaining({
        code: 'PROJECT_NOT_FOUND',
        statusCode: 404
      })
    )

    expect(findProject).not.toHaveBeenCalled()
  })
})
