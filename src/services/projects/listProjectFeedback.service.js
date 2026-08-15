import { Op } from 'sequelize'

import { ProjectFeedback } from '@src/db/models'
import BaseHandler from '@src/libs/baseHandler'
import {
  feedbackInclude,
  serializeFeedback
} from '@src/services/feedback/feedback.helpers'

import { hasPermission } from './projectMutation.helpers'
import { getProjectForRead } from './projectRead.helpers'

class ListProjectFeedbackService extends BaseHandler {
  async run () {
    const { projectId } = this.args
    const auth = this.context.auth

    await getProjectForRead(projectId, auth, this.dbTransaction)

    const canManage = hasPermission(
      auth,
      'feedback:write',
      'feedback:write:assigned'
    )
    const canReadAll = hasPermission(auth, 'feedback:read')
    const where = {
      organizationId: auth.organizationId,
      projectId
    }

    if (!canManage && !canReadAll) {
      where.subjectUserId = auth.userId
      where.visibility = 'employee_and_managers'
      where.status = {
        [Op.in]: ['published', 'acknowledged']
      }
    }

    const feedback = await ProjectFeedback.findAll({
      where,
      include: feedbackInclude,
      order: [['createdAt', 'DESC']],
      transaction: this.dbTransaction
    })

    return {
      items: feedback.map(serializeFeedback),
      canManage
    }
  }
}

export default ListProjectFeedbackService
