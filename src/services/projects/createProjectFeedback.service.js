import { StatusCodes } from 'http-status-codes'

import {
  ProjectAssignment,
  ProjectFeedback,
  sequelize
} from '@src/db/models'
import AppError from '@src/errors/app.error'
import BaseHandler from '@src/libs/baseHandler'

import {
  getOrganizationUser,
  getProjectForWrite,
  writeAuditLog
} from './projectMutation.helpers'

class CreateProjectFeedbackService extends BaseHandler {
  async run () {
    const {
      feedbackType,
      goals,
      improvementAreas,
      projectId,
      reviewPeriod,
      status = 'draft',
      strengths,
      subjectUserId,
      summary,
      visibility = 'employee_and_managers'
    } = this.args
    const auth = this.context.auth

    return sequelize.transaction(async transaction => {
      await getProjectForWrite(projectId, auth, transaction)
      await getOrganizationUser(
        subjectUserId,
        auth.organizationId,
        transaction
      )

      const assignment = await ProjectAssignment.findOne({
        where: {
          projectId,
          userId: subjectUserId,
          leftAt: null
        },
        transaction
      })

      if (!assignment) {
        throw new AppError(
          'Feedback can only be created for an active project member',
          StatusCodes.UNPROCESSABLE_ENTITY,
          null,
          {
            code: 'FEEDBACK_SUBJECT_NOT_ASSIGNED'
          }
        )
      }

      const feedback = await ProjectFeedback.create(
        {
          organizationId: auth.organizationId,
          projectId,
          subjectUserId,
          authorUserId: auth.userId,
          feedbackType,
          reviewPeriod: reviewPeriod.trim(),
          summary: summary.trim(),
          strengths: strengths || null,
          improvementAreas: improvementAreas || null,
          goals: goals || null,
          visibility,
          status,
          publishedAt: status === 'published' ? new Date() : null
        },
        {
          transaction
        }
      )

      await writeAuditLog(
        {
          action: status === 'published'
            ? 'project_feedback.published'
            : 'project_feedback.created',
          afterValue: feedback.toJSON(),
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

export default CreateProjectFeedbackService
