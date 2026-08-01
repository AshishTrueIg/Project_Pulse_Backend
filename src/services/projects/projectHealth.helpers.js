import {
  Milestone,
  Organization,
  Project,
  Risk
} from '@src/db/models'

const DEFAULT_HEALTH_POLICY = {
  version: 1,
  weights: {
    managerAssessment: 40,
    milestoneDelivery: 25,
    riskExposure: 20,
    reportingFreshness: 15
  },
  thresholds: {
    green: 75,
    amber: 50
  }
}

const ASSESSMENT_SCORES = {
  green: 100,
  amber: 60,
  red: 20,
  not_assessed: 0
}
const COMPLETE_MILESTONE_STATUSES = new Set(['accepted', 'completed'])
const ACTIVE_RISK_STATUSES = new Set(['open', 'mitigating'])
const RISK_PENALTIES = {
  critical: 40,
  high: 25,
  medium: 10,
  low: 5
}

const normalizeHealthPolicy = policy => ({
  version: Number(policy?.version) || DEFAULT_HEALTH_POLICY.version,
  weights: {
    ...DEFAULT_HEALTH_POLICY.weights,
    ...(policy?.weights || {})
  },
  thresholds: {
    ...DEFAULT_HEALTH_POLICY.thresholds,
    ...(policy?.thresholds || {})
  }
})

const round = value => Math.round(value * 100) / 100

const getMilestoneScore = (milestones, now) => {
  if (!milestones.length) return 100

  const completed = milestones.filter(milestone =>
    COMPLETE_MILESTONE_STATUSES.has(milestone.status)
  ).length
  const overdue = milestones.filter(
    milestone =>
      !COMPLETE_MILESTONE_STATUSES.has(milestone.status) &&
      new Date(`${milestone.dueDate}T23:59:59Z`) < now
  ).length
  const completionScore = (completed / milestones.length) * 100

  return Math.max(0, Math.round(completionScore - overdue * 15))
}

const getRiskScore = risks => {
  const penalty = risks
    .filter(risk => ACTIVE_RISK_STATUSES.has(risk.status))
    .reduce(
      (total, risk) => total + (RISK_PENALTIES[risk.severity] || 0),
      0
    )

  return Math.max(0, 100 - penalty)
}

const getFreshnessScore = (lastHealthUpdatedAt, cadenceDays, now) => {
  if (!lastHealthUpdatedAt) return 0

  const ageDays = Math.max(
    0,
    (now.getTime() - new Date(lastHealthUpdatedAt).getTime()) /
      (24 * 60 * 60 * 1000)
  )

  if (ageDays <= cadenceDays) return 100
  if (ageDays <= cadenceDays * 2) return 60

  return 20
}

const calculateProjectHealth = (
  project,
  policyValue,
  reportingCadenceDays,
  now = new Date()
) => {
  const policy = normalizeHealthPolicy(policyValue)
  const assessment = project.managerHealthAssessment || 'not_assessed'

  if (assessment === 'not_assessed' && !project.lastHealthUpdatedAt) {
    return {
      status: 'not_assessed',
      score: 0,
      managerAssessment: assessment,
      calculatedAt: now.toISOString(),
      factors: {
        managerAssessment: {
          score: 0,
          weight: policy.weights.managerAssessment,
          contribution: 0
        },
        milestoneDelivery: {
          score: getMilestoneScore(project.milestones || [], now),
          weight: policy.weights.milestoneDelivery,
          contribution: 0
        },
        riskExposure: {
          score: getRiskScore(project.risks || []),
          weight: policy.weights.riskExposure,
          contribution: 0
        },
        reportingFreshness: {
          score: 0,
          weight: policy.weights.reportingFreshness,
          contribution: 0
        }
      },
      signals: ['A manager health assessment is required']
    }
  }

  const factorScores = {
    managerAssessment: ASSESSMENT_SCORES[assessment] || 0,
    milestoneDelivery: getMilestoneScore(project.milestones || [], now),
    riskExposure: getRiskScore(project.risks || []),
    reportingFreshness: getFreshnessScore(
      project.lastHealthUpdatedAt,
      reportingCadenceDays,
      now
    )
  }
  const factors = Object.fromEntries(
    Object.entries(factorScores).map(([key, score]) => {
      const weight = Number(policy.weights[key])

      return [
        key,
        {
          score,
          weight,
          contribution: round((score * weight) / 100)
        }
      ]
    })
  )
  const score = Math.round(
    Object.values(factors).reduce(
      (total, factor) => total + factor.contribution,
      0
    )
  )
  const status = score >= policy.thresholds.green
    ? 'green'
    : score >= policy.thresholds.amber
      ? 'amber'
      : 'red'
  const signals = []

  if (factorScores.reportingFreshness < 100) {
    signals.push('The latest project update is outside the reporting cadence')
  }
  if (factorScores.riskExposure < 75) {
    signals.push('Active high-priority risks are reducing project health')
  }
  if (factorScores.milestoneDelivery < 60) {
    signals.push('Milestone delivery needs attention')
  }
  if (assessment === 'red') {
    signals.push('The latest manager assessment is critical')
  }

  return {
    status,
    score,
    managerAssessment: assessment,
    calculatedAt: now.toISOString(),
    factors,
    signals
  }
}

const recalculateProjectHealth = async (
  projectId,
  organizationId,
  transaction
) => {
  const project = await Project.findOne({
    where: {
      id: projectId,
      organizationId
    },
    include: [
      {
        model: Organization,
        as: 'organization',
        attributes: ['healthPolicy', 'reportingCadenceDays']
      },
      {
        model: Milestone,
        as: 'milestones',
        attributes: ['dueDate', 'status']
      },
      {
        model: Risk,
        as: 'risks',
        attributes: ['severity', 'status']
      }
    ],
    transaction
  })

  if (!project) return null

  const result = calculateProjectHealth(
    project,
    project.organization.healthPolicy,
    project.organization.reportingCadenceDays
  )

  await project.update(
    {
      overallHealth: result.status,
      healthScore: result.score,
      healthBreakdown: result
    },
    {
      transaction
    }
  )

  return result
}

const recalculateOrganizationProjects = async (
  organizationId,
  transaction
) => {
  const projects = await Project.findAll({
    where: {
      organizationId
    },
    attributes: ['id'],
    raw: true,
    transaction
  })

  return Promise.all(
    projects.map(project =>
      recalculateProjectHealth(project.id, organizationId, transaction)
    )
  )
}

export {
  calculateProjectHealth,
  DEFAULT_HEALTH_POLICY,
  normalizeHealthPolicy,
  recalculateOrganizationProjects,
  recalculateProjectHealth
}
