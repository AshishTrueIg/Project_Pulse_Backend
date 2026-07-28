import { StatusCodes } from 'http-status-codes'

import { ProjectAssignment, sequelize } from '@src/db/models'
import AppError from '@src/errors/app.error'
import BaseHandler from '@src/libs/baseHandler'

import {
  getOrganizationUser,
  getProjectForWrite,
  writeAuditLog
} from './projectMutation.helpers'

const editableFields = [
  'userId',
  'projectRole',
  'responsibilities',
  'workloadSignal',
  'isDedicated',
  'joinedAt',
  'leftAt'
]

class UpsertProjectMemberService extends BaseHandler {
  async run () {
    const { assignmentId, projectId, ...values } = this.args
    const auth = this.context.auth

    return sequelize.transaction(async transaction => {
      await getProjectForWrite(projectId, auth, transaction)
      await getOrganizationUser(
        values.userId,
        auth.organizationId,
        transaction
      )

      let assignment = null
      let beforeValue = null

      if (assignmentId) {
        assignment = await ProjectAssignment.findOne({
          where: {
            id: assignmentId,
            projectId
          },
          transaction
        })

        if (!assignment) {
          throw new AppError(
            'Project member was not found',
            StatusCodes.NOT_FOUND,
            null,
            {
              code: 'PROJECT_MEMBER_NOT_FOUND'
            }
          )
        }

        const duplicate = await ProjectAssignment.findOne({
          where: {
            projectId,
            userId: values.userId
          },
          transaction
        })

        if (duplicate && duplicate.id !== assignmentId) {
          throw new AppError(
            'This person is already assigned to the project',
            StatusCodes.CONFLICT,
            null,
            {
              code: 'PROJECT_MEMBER_EXISTS'
            }
          )
        }

        beforeValue = assignment.toJSON()
        const update = Object.fromEntries(
          editableFields
            .filter(field => Object.prototype.hasOwnProperty.call(values, field))
            .map(field => [field, values[field]])
        )

        await assignment.update(update, {
          transaction
        })
      } else {
        const existing = await ProjectAssignment.findOne({
          where: {
            projectId,
            userId: values.userId
          },
          transaction
        })

        if (existing && !existing.leftAt) {
          throw new AppError(
            'This person is already assigned to the project',
            StatusCodes.CONFLICT,
            null,
            {
              code: 'PROJECT_MEMBER_EXISTS'
            }
          )
        }

        if (existing) {
          beforeValue = existing.toJSON()
          assignment = await existing.update(
            {
              ...values,
              leftAt: null
            },
            {
              transaction
            }
          )
        } else {
          assignment = await ProjectAssignment.create(
            {
              projectId,
              ...values,
              responsibilities: values.responsibilities || null,
              leftAt: null
            },
            {
              transaction
            }
          )
        }
      }

      await writeAuditLog(
        {
          action: assignmentId || beforeValue
            ? 'project_member.updated'
            : 'project_member.created',
          afterValue: assignment.toJSON(),
          beforeValue,
          entityId: assignment.id,
          entityType: 'project_assignment',
          metadata: {
            projectId
          }
        },
        auth,
        transaction
      )

      return {
        id: assignment.id
      }
    })
  }
}

export default UpsertProjectMemberService
