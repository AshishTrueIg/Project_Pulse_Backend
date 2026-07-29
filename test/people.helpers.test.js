import { Project, ProjectAssignment } from '@src/db/models'
import {
  getPeopleScopeWhere,
  serializePerson
} from '@src/services/people/people.helpers'

describe('people access and serialization', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('scopes self-service access to the authenticated employee', async () => {
    await expect(
      getPeopleScopeWhere(
        {
          organizationId: 'organization-1',
          permissions: ['people:read:self'],
          userId: 'employee-1'
        },
        null
      )
    ).resolves.toEqual({
      id: 'employee-1',
      organizationId: 'organization-1'
    })
  })

  it('includes teammates and project managers for assigned people access', async () => {
    jest
      .spyOn(ProjectAssignment, 'findAll')
      .mockResolvedValueOnce([
        {
          projectId: 'project-1'
        }
      ])
      .mockResolvedValueOnce([
        {
          userId: 'lead-1'
        },
        {
          userId: 'employee-1'
        }
      ])
    jest.spyOn(Project, 'findAll').mockResolvedValue([
      {
        managerUserId: 'manager-1'
      }
    ])

    const scope = await getPeopleScopeWhere(
      {
        organizationId: 'organization-1',
        permissions: ['people:read:assigned'],
        userId: 'lead-1'
      },
      null
    )

    expect(scope.organizationId).toBe('organization-1')
    expect(scope.id).toBeDefined()
    expect(ProjectAssignment.findAll).toHaveBeenCalledTimes(2)
    expect(Project.findAll).toHaveBeenCalledTimes(1)
  })

  it('derives active allocation and the highest workload signal', () => {
    const person = serializePerson({
      id: 'employee-1',
      email: 'employee@example.com',
      fullName: 'Example Employee',
      jobTitle: 'Engineer',
      employeeCode: 'PP-100',
      employmentStartDate: '2024-01-01',
      totalExperienceYears: '5.5',
      skills: ['Node.js'],
      profileSummary: 'Builds reliable services.',
      status: 'active',
      lastLoginAt: null,
      roles: [
        {
          id: 'role-1',
          name: 'employee'
        }
      ],
      manager: null,
      projectAssignments: [
        {
          id: 'assignment-1',
          projectRole: 'Backend Engineer',
          responsibilities: 'Own APIs',
          workloadSignal: 'normal',
          isDedicated: true,
          joinedAt: '2026-01-01',
          leftAt: null,
          project: {
            id: 'project-1',
            code: 'ONE',
            name: 'Project One',
            overallHealth: 'green',
            stage: 'active_development',
            status: 'active',
            client: {
              id: 'client-1',
              name: 'Client One'
            }
          }
        },
        {
          id: 'assignment-2',
          projectRole: 'Reviewer',
          responsibilities: null,
          workloadSignal: 'heavy',
          isDedicated: false,
          joinedAt: '2026-02-01',
          leftAt: null,
          project: {
            id: 'project-2',
            code: 'TWO',
            name: 'Project Two',
            overallHealth: 'amber',
            stage: 'mvp_review',
            status: 'active',
            client: {
              id: 'client-2',
              name: 'Client Two'
            }
          }
        }
      ]
    })

    expect(person).toEqual(
      expect.objectContaining({
        activeProjects: 2,
        dedicatedProjects: 1,
        initials: 'EE',
        totalExperienceYears: 5.5,
        workloadSignal: 'heavy'
      })
    )
  })
})
