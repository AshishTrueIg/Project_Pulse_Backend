import { StatusCodes } from 'http-status-codes'

import { Project, sequelize } from '@src/db/models'
import AppError from '@src/errors/app.error'
import BaseHandler from '@src/libs/baseHandler'

import {
  getOrganizationClient,
  getOrganizationUser,
  writeAuditLog
} from './projectMutation.helpers'
import { recalculateProjectHealth } from './projectHealth.helpers'

class CreateProjectService extends BaseHandler {
  async run () {
    const {
      clientId,
      code,
      managerUserId,
      name,
      overallHealth = 'not_assessed',
      stage,
      startDate,
      status = 'active',
      targetEndDate
    } = this.args
    const auth = this.context.auth

    return sequelize.transaction(async transaction => {
      if (targetEndDate && targetEndDate < startDate) {
        throw new AppError(
          'Target end date cannot be earlier than the start date',
          StatusCodes.UNPROCESSABLE_ENTITY,
          null,
          {
            code: 'INVALID_PROJECT_TIMELINE'
          }
        )
      }

      await Promise.all([
        getOrganizationClient(clientId, auth.organizationId, transaction),
        getOrganizationUser(managerUserId, auth.organizationId, transaction)
      ])

      const normalizedCode = code.trim().toUpperCase()
      const existingProject = await Project.findOne({
        where: {
          organizationId: auth.organizationId,
          code: normalizedCode
        },
        transaction
      })

      if (existingProject) {
        throw new AppError(
          'A project with this code already exists',
          StatusCodes.CONFLICT,
          null,
          {
            code: 'PROJECT_CODE_EXISTS'
          }
        )
      }

      const project = await Project.create(
        {
          organizationId: auth.organizationId,
          clientId,
          code: normalizedCode,
          managerUserId,
          name: name.trim(),
          overallHealth,
          managerHealthAssessment: overallHealth,
          stage,
          startDate,
          status,
          targetEndDate: targetEndDate || null,
          lastHealthUpdatedAt:
            overallHealth === 'not_assessed' ? null : new Date()
        },
        {
          transaction
        }
      )

      await writeAuditLog(
        {
          action: 'project.created',
          afterValue: project.toJSON(),
          entityId: project.id,
          entityType: 'project'
        },
        auth,
        transaction
      )

      await recalculateProjectHealth(
        project.id,
        auth.organizationId,
        transaction
      )

      return {
        id: project.id
      }
    })
  }
}

export default CreateProjectService
