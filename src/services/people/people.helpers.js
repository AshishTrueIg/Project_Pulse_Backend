import { StatusCodes } from 'http-status-codes'
import { Op } from 'sequelize'

import {
  Client,
  Project,
  ProjectAssignment,
  Role,
  User
} from '@src/db/models'
import AppError from '@src/errors/app.error'

const WORKLOAD_RANK = {
  light: 1,
  normal: 2,
  heavy: 3,
  overloaded: 4
}

const hasPermission = (auth, ...permissions) => {
  const granted = new Set(auth.permissions || [])

  return granted.has('*') || permissions.some(permission => granted.has(permission))
}

const getPeopleScopeWhere = async (auth, transaction) => {
  if (hasPermission(auth, 'people:read', 'people:write')) {
    return {
      organizationId: auth.organizationId
    }
  }

  if (hasPermission(auth, 'people:read:self')) {
    return {
      organizationId: auth.organizationId,
      id: auth.userId
    }
  }

  if (hasPermission(auth, 'people:read:assigned')) {
    const ownAssignments = await ProjectAssignment.findAll({
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
    const projectIds = ownAssignments.map(assignment => assignment.projectId)
    const [teammates, projects] = await Promise.all([
      ProjectAssignment.findAll({
        where: {
          projectId: {
            [Op.in]: projectIds
          },
          leftAt: {
            [Op.is]: null
          }
        },
        attributes: ['userId'],
        raw: true,
        transaction
      }),
      Project.findAll({
        where: {
          id: {
            [Op.in]: projectIds
          },
          organizationId: auth.organizationId
        },
        attributes: ['managerUserId'],
        raw: true,
        transaction
      })
    ])
    const visibleIds = new Set([
      auth.userId,
      ...teammates.map(assignment => assignment.userId),
      ...projects.map(project => project.managerUserId)
    ])

    return {
      organizationId: auth.organizationId,
      id: {
        [Op.in]: [...visibleIds]
      }
    }
  }

  throw new AppError(
    'You do not have permission to view people',
    StatusCodes.FORBIDDEN,
    null,
    {
      code: 'PEOPLE_ACCESS_DENIED'
    }
  )
}

const personIncludes = [
  {
    model: Role,
    as: 'roles',
    attributes: ['id', 'name'],
    through: {
      attributes: []
    }
  },
  {
    model: User,
    as: 'manager',
    attributes: ['id', 'fullName', 'email', 'jobTitle']
  },
  {
    model: ProjectAssignment,
    as: 'projectAssignments',
    include: [
      {
        model: Project,
        as: 'project',
        attributes: [
          'id',
          'code',
          'name',
          'overallHealth',
          'stage',
          'status'
        ],
        include: [
          {
            model: Client,
            as: 'client',
            attributes: ['id', 'name']
          }
        ]
      }
    ]
  }
]

const getInitials = fullName =>
  fullName
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase()

const getActiveAssignments = person =>
  person.projectAssignments.filter(assignment => !assignment.leftAt)

const getWorkloadSignal = assignments => {
  if (!assignments.length) return 'unallocated'

  return assignments.reduce(
    (highest, assignment) =>
      WORKLOAD_RANK[assignment.workloadSignal] > WORKLOAD_RANK[highest]
        ? assignment.workloadSignal
        : highest,
    'light'
  )
}

const formatAssignment = assignment => ({
  id: assignment.id,
  projectRole: assignment.projectRole,
  responsibilities: assignment.responsibilities,
  workloadSignal: assignment.workloadSignal,
  isDedicated: assignment.isDedicated,
  joinedAt: assignment.joinedAt,
  leftAt: assignment.leftAt,
  project: {
    id: assignment.project.id,
    code: assignment.project.code,
    name: assignment.project.name,
    health: assignment.project.overallHealth,
    stage: assignment.project.stage,
    status: assignment.project.status,
    client: assignment.project.client
  }
})

const serializePerson = person => {
  const activeAssignments = getActiveAssignments(person)

  return {
    id: person.id,
    email: person.email,
    fullName: person.fullName,
    initials: getInitials(person.fullName),
    jobTitle: person.jobTitle,
    employeeCode: person.employeeCode,
    employmentStartDate: person.employmentStartDate,
    totalExperienceYears: person.totalExperienceYears === null
      ? null
      : Number(person.totalExperienceYears),
    skills: person.skills || [],
    profileSummary: person.profileSummary,
    status: person.status,
    lastLoginAt: person.lastLoginAt,
    roles: person.roles.map(role => ({
      id: role.id,
      name: role.name
    })),
    manager: person.manager,
    workloadSignal: getWorkloadSignal(activeAssignments),
    activeProjects: activeAssignments.length,
    dedicatedProjects: activeAssignments.filter(
      assignment => assignment.isDedicated
    ).length,
    projects: activeAssignments.map(formatAssignment)
  }
}

export {
  formatAssignment,
  getActiveAssignments,
  getPeopleScopeWhere,
  getWorkloadSignal,
  hasPermission,
  personIncludes,
  serializePerson
}
