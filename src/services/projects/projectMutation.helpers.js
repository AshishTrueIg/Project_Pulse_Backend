import { StatusCodes } from 'http-status-codes'
import { Op } from 'sequelize'

import {
  AuditLog,
  Client,
  Project,
  ProjectAssignment,
  User
} from '@src/db/models'
import AppError from '@src/errors/app.error'

const hasPermission = (auth, ...permissions) => {
  const granted = new Set(auth.permissions || [])

  return granted.has('*') || permissions.some(permission => granted.has(permission))
}

const getProjectForWrite = async (
  projectId,
  auth,
  transaction,
  options = {}
) => {
  const canWriteAll = hasPermission(auth, 'projects:write')
  const canWriteAssigned = hasPermission(auth, 'projects:update:assigned')

  if (!canWriteAll && !canWriteAssigned) {
    throw new AppError(
      'You do not have permission to update projects',
      StatusCodes.FORBIDDEN,
      null,
      {
        code: 'PROJECT_WRITE_DENIED'
      }
    )
  }

  let assignedProjectIds = null

  if (!canWriteAll) {
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

    assignedProjectIds = assignments.map(assignment => assignment.projectId)
  }

  if (assignedProjectIds && !assignedProjectIds.includes(projectId)) {
    throw new AppError(
      'Project was not found',
      StatusCodes.NOT_FOUND,
      null,
      {
        code: 'PROJECT_NOT_FOUND'
      }
    )
  }

  const project = await Project.findOne({
    where: {
      organizationId: auth.organizationId,
      id: projectId
    },
    ...options,
    transaction
  })

  if (!project) {
    throw new AppError(
      'Project was not found',
      StatusCodes.NOT_FOUND,
      null,
      {
        code: 'PROJECT_NOT_FOUND'
      }
    )
  }

  return project
}

const getOrganizationClient = async (clientId, organizationId, transaction) => {
  const client = await Client.findOne({
    where: {
      id: clientId,
      organizationId
    },
    transaction
  })

  if (!client) {
    throw new AppError(
      'Select a client from your organization',
      StatusCodes.UNPROCESSABLE_ENTITY,
      null,
      {
        code: 'INVALID_PROJECT_CLIENT'
      }
    )
  }

  return client
}

const getOrganizationUser = async (userId, organizationId, transaction) => {
  const user = await User.findOne({
    where: {
      id: userId,
      organizationId,
      status: 'active'
    },
    transaction
  })

  if (!user) {
    throw new AppError(
      'Select an active user from your organization',
      StatusCodes.UNPROCESSABLE_ENTITY,
      null,
      {
        code: 'INVALID_PROJECT_USER'
      }
    )
  }

  return user
}

const ensureProjectContributor = async (
  userId,
  project,
  transaction
) => {
  if (userId === project.managerUserId) return

  const assignment = await ProjectAssignment.findOne({
    where: {
      projectId: project.id,
      userId,
      leftAt: {
        [Op.is]: null
      }
    },
    transaction
  })

  if (!assignment) {
    throw new AppError(
      'Select the project manager or an active project team member',
      StatusCodes.UNPROCESSABLE_ENTITY,
      null,
      {
        code: 'PROJECT_OWNER_NOT_ASSIGNED'
      }
    )
  }
}

const writeAuditLog = (
  {
    action,
    afterValue,
    beforeValue,
    entityId,
    entityType,
    metadata
  },
  auth,
  transaction
) =>
  AuditLog.create(
    {
      organizationId: auth.organizationId,
      actorUserId: auth.userId,
      action,
      entityType,
      entityId,
      beforeValue: beforeValue || null,
      afterValue: afterValue || null,
      metadata: metadata || null
    },
    {
      transaction
    }
  )

export {
  ensureProjectContributor,
  getOrganizationClient,
  getOrganizationUser,
  getProjectForWrite,
  hasPermission,
  writeAuditLog
}
