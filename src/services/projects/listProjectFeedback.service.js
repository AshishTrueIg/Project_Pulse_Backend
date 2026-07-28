import { Op } from 'sequelize'

import { ProjectFeedback, User } from '@src/db/models'
import BaseHandler from '@src/libs/baseHandler'

import { hasPermission } from './projectMutation.helpers'
import { getProjectForRead } from './projectRead.helpers'

const include = [
  {
    model: User,
    as: 'subject',
    attributes: ['id', 'fullName', 'email', 'jobTitle']
  },
  {
    model: User,
    as: 'author',
    attributes: ['id', 'fullName', 'jobTitle']
  }
]

const serializeFeedback = feedback => ({
  id: feedback.id,
  projectId: feedback.projectId,
  feedbackType: feedback.feedbackType,
  reviewPeriod: feedback.reviewPeriod,
  summary: feedback.summary,
  strengths: feedback.strengths,
  improvementAreas: feedback.improvementAreas,
  goals: feedback.goals,
  visibility: feedback.visibility,
  status: feedback.status,
  employeeResponse: feedback.employeeResponse,
  publishedAt: feedback.publishedAt,
  acknowledgedAt: feedback.acknowledgedAt,
  createdAt: feedback.createdAt,
  updatedAt: feedback.updatedAt,
  subject: feedback.subject,
  author: feedback.author
})

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
    const where = {
      organizationId: auth.organizationId,
      projectId
    }

    if (!canManage) {
      where.subjectUserId = auth.userId
      where.visibility = 'employee_and_managers'
      where.status = {
        [Op.in]: ['published', 'acknowledged']
      }
    }

    const feedback = await ProjectFeedback.findAll({
      where,
      include,
      order: [['createdAt', 'DESC']],
      transaction: this.dbTransaction
    })

    return {
      items: feedback.map(serializeFeedback),
      canManage
    }
  }
}

export { serializeFeedback }
export default ListProjectFeedbackService
