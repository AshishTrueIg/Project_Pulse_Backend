import { StatusCodes } from 'http-status-codes'
import { Op } from 'sequelize'

import {
  Client,
  Milestone,
  ProjectAssignment,
  Risk,
  User
} from '@src/db/models'
import AppError from '@src/errors/app.error'

const COMPLETED_MILESTONE_STATUSES = new Set(['accepted', 'completed'])
const ACTIVE_RISK_STATUSES = new Set(['open', 'mitigating'])
const FULL_PROJECT_READ_PERMISSIONS = new Set(['*', 'projects:read'])
const ASSIGNED_PROJECT_READ_PERMISSION = 'projects:read:assigned'

const labelAcronyms = {
  api: 'API',
  mvp: 'MVP',
  sso: 'SSO'
}

const formatLabel = value =>
  value
    .split('_')
    .map(
      word =>
        labelAcronyms[word] ||
        word.charAt(0).toUpperCase() + word.slice(1)
    )
    .join(' ')

const getInitials = fullName =>
  fullName
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase()

const formatProjectExperience = (joinedAt, leftAt) => {
  const start = new Date(`${joinedAt}T00:00:00Z`)
  const end = leftAt ? new Date(`${leftAt}T00:00:00Z`) : new Date()
  const months = Math.max(
    0,
    (end.getUTCFullYear() - start.getUTCFullYear()) * 12 +
      end.getUTCMonth() -
      start.getUTCMonth()
  )

  if (months < 1) return 'Less than a month'
  if (months < 12) return `${months} ${months === 1 ? 'month' : 'months'}`

  const years = Math.floor(months / 12)
  const remainingMonths = months % 12

  return remainingMonths
    ? `${years}y ${remainingMonths}m`
    : `${years} ${years === 1 ? 'year' : 'years'}`
}

const getProjectProgress = milestones => {
  if (!milestones.length) return 0

  const completed = milestones.filter(milestone =>
    COMPLETED_MILESTONE_STATUSES.has(milestone.status)
  ).length

  return Math.round((completed / milestones.length) * 100)
}

const getNextMilestone = milestones =>
  [...milestones]
    .filter(milestone => !COMPLETED_MILESTONE_STATUSES.has(milestone.status))
    .sort((left, right) => left.dueDate.localeCompare(right.dueDate))[0] || null

const getActiveAssignments = assignments =>
  assignments.filter(assignment => !assignment.leftAt)

const getActiveRisks = risks =>
  risks.filter(risk => ACTIVE_RISK_STATUSES.has(risk.status))

const projectIncludes = [
  {
    model: Client,
    as: 'client',
    attributes: [
      'id',
      'name',
      'primaryContactName',
      'primaryContactEmail',
      'status'
    ]
  },
  {
    model: User,
    as: 'manager',
    attributes: ['id', 'fullName', 'email', 'jobTitle']
  },
  {
    model: ProjectAssignment,
    as: 'assignments',
    include: [
      {
        model: User,
        as: 'member',
        attributes: ['id', 'fullName', 'email', 'jobTitle']
      }
    ]
  },
  {
    model: Milestone,
    as: 'milestones',
    include: [
      {
        model: User,
        as: 'owner',
        attributes: ['id', 'fullName']
      },
      {
        model: User,
        as: 'acceptedBy',
        attributes: ['id', 'fullName']
      }
    ]
  },
  {
    model: Risk,
    as: 'risks',
    include: [
      {
        model: User,
        as: 'owner',
        attributes: ['id', 'fullName']
      }
    ]
  }
]

const getScopedProjectWhere = async (auth, transaction) => {
  const permissions = new Set(auth.permissions || [])
  const canReadAll = [...FULL_PROJECT_READ_PERMISSIONS].some(permission =>
    permissions.has(permission)
  )

  if (canReadAll) {
    return {
      organizationId: auth.organizationId
    }
  }

  if (!permissions.has(ASSIGNED_PROJECT_READ_PERMISSION)) {
    throw new AppError(
      'You do not have permission to view projects',
      StatusCodes.FORBIDDEN,
      null,
      {
        code: 'PROJECT_ACCESS_DENIED'
      }
    )
  }

  const assignments = await ProjectAssignment.findAll({
    where: {
      userId: auth.userId,
      leftAt: {
        [Op.is]: null
      }
    },
    attributes: ['projectId'],
    raw: true,
    transaction
  })

  return {
    organizationId: auth.organizationId,
    id: {
      [Op.in]: assignments.map(assignment => assignment.projectId)
    }
  }
}

const serializeProjectListItem = project => {
  const assignments = getActiveAssignments(project.assignments)
  const activeRisks = getActiveRisks(project.risks)
  const completedMilestones = project.milestones.filter(milestone =>
    COMPLETED_MILESTONE_STATUSES.has(milestone.status)
  ).length
  const nextMilestone = getNextMilestone(project.milestones)

  return {
    id: project.id,
    code: project.code,
    name: project.name,
    client: {
      id: project.client.id,
      name: project.client.name
    },
    manager: {
      id: project.manager.id,
      fullName: project.manager.fullName,
      initials: getInitials(project.manager.fullName)
    },
    stage: project.stage,
    stageLabel: formatLabel(project.stage),
    health: project.overallHealth,
    healthScore: Number(project.healthScore || 0),
    managerHealthAssessment:
      project.managerHealthAssessment || 'not_assessed',
    healthBreakdown: project.healthBreakdown || null,
    status: project.status,
    startDate: project.startDate,
    targetEndDate: project.targetEndDate,
    lastHealthUpdatedAt: project.lastHealthUpdatedAt,
    progress: getProjectProgress(project.milestones),
    milestones: {
      completed: completedMilestones,
      total: project.milestones.length,
      next: nextMilestone
        ? {
            id: nextMilestone.id,
            name: nextMilestone.name,
            dueDate: nextMilestone.dueDate,
            status: nextMilestone.status
          }
        : null
    },
    risks: {
      open: activeRisks.length,
      highPriority: activeRisks.filter(risk =>
        ['high', 'critical'].includes(risk.severity)
      ).length
    },
    team: {
      count: assignments.length,
      dedicated: assignments.filter(assignment => assignment.isDedicated).length,
      preview: assignments.slice(0, 4).map(assignment => ({
        id: assignment.member.id,
        fullName: assignment.member.fullName,
        initials: getInitials(assignment.member.fullName)
      }))
    }
  }
}

const serializeProjectDetail = project => {
  const assignments = getActiveAssignments(project.assignments)
  const completedMilestones = project.milestones.filter(milestone =>
    COMPLETED_MILESTONE_STATUSES.has(milestone.status)
  )
  const nextMilestone = getNextMilestone(project.milestones)

  return {
    ...serializeProjectListItem(project),
    client: {
      id: project.client.id,
      name: project.client.name,
      primaryContactName: project.client.primaryContactName,
      primaryContactEmail: project.client.primaryContactEmail,
      status: project.client.status
    },
    manager: {
      id: project.manager.id,
      email: project.manager.email,
      fullName: project.manager.fullName,
      initials: getInitials(project.manager.fullName),
      jobTitle: project.manager.jobTitle
    },
    delivery: {
      completedMilestones: completedMilestones.length,
      totalMilestones: project.milestones.length,
      nextMilestone: nextMilestone
        ? {
            id: nextMilestone.id,
            name: nextMilestone.name,
            dueDate: nextMilestone.dueDate,
            status: nextMilestone.status,
            statusLabel: formatLabel(nextMilestone.status)
          }
        : null
    },
    team: assignments.map(assignment => ({
      assignmentId: assignment.id,
      id: assignment.member.id,
      email: assignment.member.email,
      fullName: assignment.member.fullName,
      initials: getInitials(assignment.member.fullName),
      isDedicated: assignment.isDedicated,
      jobTitle: assignment.member.jobTitle,
      joinedAt: assignment.joinedAt,
      projectExperience: formatProjectExperience(
        assignment.joinedAt,
        assignment.leftAt
      ),
      projectRole: assignment.projectRole,
      responsibilities: assignment.responsibilities,
      workloadSignal: assignment.workloadSignal
    })),
    milestones: [...project.milestones]
      .sort((left, right) => left.dueDate.localeCompare(right.dueDate))
      .map(milestone => ({
        acceptanceCriteria: milestone.acceptanceCriteria,
        acceptedAt: milestone.acceptedAt,
        acceptedBy: milestone.acceptedBy
          ? {
              id: milestone.acceptedBy.id,
              fullName: milestone.acceptedBy.fullName
            }
          : null,
        dueDate: milestone.dueDate,
        id: milestone.id,
        name: milestone.name,
        owner: {
          id: milestone.owner.id,
          fullName: milestone.owner.fullName
        },
        status: milestone.status,
        statusLabel: formatLabel(milestone.status),
        type: milestone.milestoneType
      })),
    risks: [...project.risks]
      .sort((left, right) => {
        const priority = {
          critical: 4,
          high: 3,
          medium: 2,
          low: 1
        }

        return priority[right.severity] - priority[left.severity]
      })
      .map(risk => ({
        description: risk.description,
        id: risk.id,
        owner: {
          id: risk.owner.id,
          fullName: risk.owner.fullName
        },
        severity: risk.severity,
        status: risk.status,
        targetDate: risk.targetDate,
        title: risk.title
      }))
  }
}

export {
  formatLabel,
  getScopedProjectWhere,
  projectIncludes,
  serializeProjectDetail,
  serializeProjectListItem
}
