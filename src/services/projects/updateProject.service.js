import { StatusCodes } from 'http-status-codes'
import { Op } from 'sequelize'

import { Project, sequelize } from '@src/db/models'
import AppError from '@src/errors/app.error'
import BaseHandler from '@src/libs/baseHandler'

import {
  getOrganizationClient,
  getOrganizationUser,
  getProjectForWrite,
  hasPermission,
  writeAuditLog
} from './projectMutation.helpers'

const editableFields = [
  'clientId',
  'managerUserId',
  'name',
  'stage',
  'overallHealth',
  'startDate',
  'targetEndDate',
  'status'
]

class UpdateProjectService extends BaseHandler {
  async run () {
    const { projectId, ...changes } = this.args
    const auth = this.context.auth

    return sequelize.transaction(async transaction => {
      const project = await getProjectForWrite(projectId, auth, transaction)
      const beforeValue = project.toJSON()
      const canEditCoreFields = hasPermission(auth, 'projects:write')
      const assignedUpdateFields = [
        'stage',
        'overallHealth',
        'status',
        'targetEndDate'
      ]
      const attemptedFields = Object.keys(changes).filter(field =>
        Object.prototype.hasOwnProperty.call(changes, field)
      )

      if (
        !canEditCoreFields &&
        attemptedFields.some(field => !assignedUpdateFields.includes(field))
      ) {
        throw new AppError(
          'Assigned project leads can update delivery state, but not core project ownership',
          StatusCodes.FORBIDDEN,
          null,
          {
            code: 'PROJECT_CORE_UPDATE_DENIED'
          }
        )
      }

      const update = Object.fromEntries(
        editableFields
          .filter(field => Object.prototype.hasOwnProperty.call(changes, field))
          .map(field => [field, changes[field] || null])
      )

      if (changes.code) {
        const normalizedCode = changes.code.trim().toUpperCase()
        const duplicate = await Project.findOne({
          where: {
            organizationId: auth.organizationId,
            code: normalizedCode,
            id: {
              [Op.ne]: projectId
            }
          },
          transaction
        })

        if (duplicate) {
          throw new AppError(
            'A project with this code already exists',
            StatusCodes.CONFLICT,
            null,
            {
              code: 'PROJECT_CODE_EXISTS'
            }
          )
        }

        update.code = normalizedCode
      }

      if (changes.clientId) {
        await getOrganizationClient(
          changes.clientId,
          auth.organizationId,
          transaction
        )
      }

      if (changes.managerUserId) {
        await getOrganizationUser(
          changes.managerUserId,
          auth.organizationId,
          transaction
        )
      }

      if (
        changes.overallHealth &&
        changes.overallHealth !== project.overallHealth
      ) {
        update.lastHealthUpdatedAt = new Date()
      }

      const nextStartDate = update.startDate || project.startDate
      const nextTargetEndDate =
        Object.prototype.hasOwnProperty.call(update, 'targetEndDate')
          ? update.targetEndDate
          : project.targetEndDate

      if (nextTargetEndDate && nextTargetEndDate < nextStartDate) {
        throw new AppError(
          'Target end date cannot be earlier than the start date',
          StatusCodes.UNPROCESSABLE_ENTITY,
          null,
          {
            code: 'INVALID_PROJECT_TIMELINE'
          }
        )
      }

      await project.update(update, {
        transaction
      })

      await writeAuditLog(
        {
          action: 'project.updated',
          afterValue: project.toJSON(),
          beforeValue,
          entityId: project.id,
          entityType: 'project'
        },
        auth,
        transaction
      )

      return {
        id: project.id
      }
    })
  }
}

export default UpdateProjectService
