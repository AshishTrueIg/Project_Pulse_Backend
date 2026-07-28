import { StatusCodes } from 'http-status-codes'

import { ProjectFeedback, sequelize } from '@src/db/models'
import AppError from '@src/errors/app.error'
import BaseHandler from '@src/libs/baseHandler'

import {
  getProjectForWrite,
  hasPermission,
  writeAuditLog
} from './projectMutation.helpers'
import { getProjectForRead } from './projectRead.helpers'

const editableFields = [
  'feedbackType',
  'reviewPeriod',
  'summary',
  'strengths',
  'improvementAreas',
  'goals',
  'visibility'
]

class UpdateProjectFeedbackService extends BaseHandler {
  async run () {
    const { feedbackId, projectId, ...changes } = this.args
    const auth = this.context.auth

    return sequelize.transaction(async transaction => {
      const canManage = hasPermission(
        auth,
        'feedback:write',
        'feedback:write:assigned'
      )

      if (canManage) {
        await getProjectForWrite(projectId, auth, transaction)
      } else {
        await getProjectForRead(projectId, auth, transaction)
      }

      const feedback = await ProjectFeedback.findOne({
        where: {
          id: feedbackId,
          organizationId: auth.organizationId,
          projectId
        },
        transaction
      })

      if (!feedback) {
        throw new AppError(
          'Feedback was not found',
          StatusCodes.NOT_FOUND,
          null,
          {
            code: 'PROJECT_FEEDBACK_NOT_FOUND'
          }
        )
      }

      const beforeValue = feedback.toJSON()

      if (!canManage) {
        if (
          feedback.subjectUserId !== auth.userId ||
          feedback.status !== 'published' ||
          feedback.visibility !== 'employee_and_managers'
        ) {
          throw new AppError(
            'Only published feedback addressed to you can be acknowledged',
            StatusCodes.FORBIDDEN,
            null,
            {
              code: 'FEEDBACK_ACKNOWLEDGEMENT_DENIED'
            }
          )
        }

        await feedback.update(
          {
            employeeResponse: changes.employeeResponse || null,
            status: 'acknowledged',
            acknowledgedAt: new Date()
          },
          {
            transaction
          }
        )
      } else {
        if (feedback.status !== 'draft') {
          throw new AppError(
            'Published feedback is immutable; create a new review for corrections',
            StatusCodes.CONFLICT,
            null,
            {
              code: 'PUBLISHED_FEEDBACK_IMMUTABLE'
            }
          )
        }

        const update = Object.fromEntries(
          editableFields
            .filter(field => Object.prototype.hasOwnProperty.call(changes, field))
            .map(field => [field, changes[field] || null])
        )

        if (changes.status === 'published') {
          update.status = 'published'
          update.publishedAt = new Date()
        }

        await feedback.update(update, {
          transaction
        })
      }

      await writeAuditLog(
        {
          action: canManage
            ? feedback.status === 'published'
                ? 'project_feedback.published'
                : 'project_feedback.updated'
            : 'project_feedback.acknowledged',
          afterValue: feedback.toJSON(),
          beforeValue,
          entityId: feedback.id,
          entityType: 'project_feedback',
          metadata: {
            projectId
          }
        },
        auth,
        transaction
      )

      return {
        id: feedback.id
      }
    })
  }
}

export default UpdateProjectFeedbackService
