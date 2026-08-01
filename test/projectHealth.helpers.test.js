import {
  calculateProjectHealth,
  normalizeHealthPolicy
} from '@src/services/projects/projectHealth.helpers'

const now = new Date('2026-07-31T12:00:00.000Z')

describe('project health calculation', () => {
  it('combines assessment, delivery, risks and reporting freshness', () => {
    const result = calculateProjectHealth(
      {
        managerHealthAssessment: 'green',
        lastHealthUpdatedAt: new Date('2026-07-30T12:00:00.000Z'),
        milestones: [
          {
            dueDate: '2026-07-01',
            status: 'accepted'
          },
          {
            dueDate: '2026-07-20',
            status: 'in_progress'
          }
        ],
        risks: [
          {
            severity: 'high',
            status: 'open'
          }
        ]
      },
      null,
      7,
      now
    )

    expect(result.status).toBe('green')
    expect(result.score).toBe(79)
    expect(result.factors).toEqual(
      expect.objectContaining({
        managerAssessment: {
          contribution: 40,
          score: 100,
          weight: 40
        },
        milestoneDelivery: {
          contribution: 8.75,
          score: 35,
          weight: 25
        },
        riskExposure: {
          contribution: 15,
          score: 75,
          weight: 20
        },
        reportingFreshness: {
          contribution: 15,
          score: 100,
          weight: 15
        }
      })
    )
  })

  it('keeps a project not assessed until a manager submits an update', () => {
    const result = calculateProjectHealth(
      {
        managerHealthAssessment: 'not_assessed',
        lastHealthUpdatedAt: null,
        milestones: [],
        risks: []
      },
      null,
      7,
      now
    )

    expect(result.status).toBe('not_assessed')
    expect(result.score).toBe(0)
    expect(result.signals).toContain(
      'A manager health assessment is required'
    )
  })

  it('merges a partial saved policy with safe defaults', () => {
    const policy = normalizeHealthPolicy({
      thresholds: {
        green: 80
      },
      weights: {
        managerAssessment: 50
      }
    })

    expect(policy.thresholds).toEqual({
      amber: 50,
      green: 80
    })
    expect(policy.weights).toEqual({
      managerAssessment: 50,
      milestoneDelivery: 25,
      reportingFreshness: 15,
      riskExposure: 20
    })
  })
})
