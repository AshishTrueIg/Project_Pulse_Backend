import {
  serializeProjectDetail,
  serializeProjectListItem
} from '@src/services/projects/project.helpers'

const createProject = () => ({
  id: 'project-1',
  code: 'PRJ',
  name: 'Project One',
  stage: 'active_development',
  overallHealth: 'amber',
  managerHealthAssessment: 'amber',
  healthScore: 58,
  healthBreakdown: {
    status: 'amber',
    score: 58
  },
  status: 'active',
  startDate: '2026-01-01',
  targetEndDate: '2026-12-31',
  lastHealthUpdatedAt: new Date('2026-07-20T00:00:00Z'),
  client: {
    id: 'client-1',
    name: 'Client One',
    primaryContactName: 'Client Owner',
    primaryContactEmail: 'owner@client.example',
    status: 'active'
  },
  manager: {
    id: 'manager-1',
    fullName: 'Manager One',
    email: 'manager@example.com',
    jobTitle: 'Delivery Manager'
  },
  assignments: [
    {
      id: 'assignment-1',
      joinedAt: '2026-01-01',
      leftAt: null,
      isDedicated: true,
      projectRole: 'Technical Lead',
      responsibilities: 'Own technical delivery',
      workloadSignal: 'normal',
      member: {
        id: 'user-1',
        fullName: 'Team Member',
        email: 'member@example.com',
        jobTitle: 'Engineer'
      }
    }
  ],
  milestones: [
    {
      id: 'milestone-1',
      acceptanceCriteria: 'Accepted scope',
      acceptedAt: new Date('2026-06-01T00:00:00Z'),
      acceptedBy: {
        id: 'manager-1',
        fullName: 'Manager One'
      },
      dueDate: '2026-06-01',
      milestoneType: 'mvp',
      name: 'MVP 1',
      owner: {
        id: 'user-1',
        fullName: 'Team Member'
      },
      status: 'accepted'
    },
    {
      id: 'milestone-2',
      acceptanceCriteria: 'Planned scope',
      acceptedAt: null,
      acceptedBy: null,
      dueDate: '2026-08-01',
      milestoneType: 'mvp',
      name: 'MVP 2',
      owner: {
        id: 'user-1',
        fullName: 'Team Member'
      },
      status: 'planned'
    }
  ],
  risks: [
    {
      id: 'risk-1',
      description: 'Active delivery risk',
      owner: {
        id: 'manager-1',
        fullName: 'Manager One'
      },
      severity: 'high',
      status: 'open',
      targetDate: '2026-08-10',
      title: 'Active risk'
    },
    {
      id: 'risk-2',
      description: 'Resolved delivery risk',
      owner: {
        id: 'manager-1',
        fullName: 'Manager One'
      },
      severity: 'low',
      status: 'resolved',
      targetDate: null,
      title: 'Resolved risk'
    }
  ]
})

describe('project serializers', () => {
  it('builds a compact list item with delivery signals', () => {
    const result = serializeProjectListItem(createProject())

    expect(result).toEqual(
      expect.objectContaining({
        progress: 50,
        stageLabel: 'Active Development',
        team: expect.objectContaining({
          count: 1,
          dedicated: 1
        }),
        risks: {
          highPriority: 1,
          open: 1
        }
      })
    )
    expect(result.milestones.next.name).toBe('MVP 2')
  })

  it('returns project detail with risk history and assignment context', () => {
    const result = serializeProjectDetail(createProject())

    expect(result.healthScore).toBe(58)
    expect(result.managerHealthAssessment).toBe('amber')
    expect(result.risks).toHaveLength(2)
    expect(result.team[0]).toEqual(
      expect.objectContaining({
        projectRole: 'Technical Lead',
        responsibilities: 'Own technical delivery'
      })
    )
    expect(result.milestones).toHaveLength(2)
  })
})
