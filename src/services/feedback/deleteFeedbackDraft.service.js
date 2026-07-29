import { StatusCodes } from 'http-status-codes'

import { ProjectFeedback, sequelize } from '@src/db/models'
import AppError from '@src/errors/app.error'
import BaseHandler from '@src/libs/baseHandler'

import {
  getProjectForWrite,
  writeAuditLog
} from '../projects/projectMutation.helpers'

class DeleteFeedbackDraftService extends BaseHandler {
  async run () {
    const { feedbackId } = this.args
    const auth = this.context.auth

    return sequelize.transaction(async transaction => {
      const feedback = await ProjectFeedback.findOne({
        where: {
          id: feedbackId,
          organizationId: auth.organizationId
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

      await getProjectForWrite(feedback.projectId, auth, transaction)

      if (feedback.status !== 'draft') {
        throw new AppError(
          'Only draft feedback can be discarded',
          StatusCodes.CONFLICT,
          null,
          {
            code: 'FEEDBACK_NOT_DRAFT'
          }
        )
      }

      const beforeValue = feedback.toJSON()

      await feedback.destroy({ transaction })
      await writeAuditLog(
        {
          action: 'project_feedback.deleted',
          beforeValue,
          entityId: feedback.id,
          entityType: 'project_feedback',
          metadata: {
            projectId: feedback.projectId
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

export default DeleteFeedbackDraftService
