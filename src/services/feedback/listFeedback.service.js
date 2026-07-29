import { ProjectFeedback } from '@src/db/models'
import BaseHandler from '@src/libs/baseHandler'

import { hasPermission } from '../projects/projectMutation.helpers'
import {
  feedbackInclude,
  getFeedbackScopeWhere,
  serializeFeedback
} from './feedback.helpers'

const DEFAULT_PAGE_SIZE = 10
const MAX_PAGE_SIZE = 100

class ListFeedbackService extends BaseHandler {
  async run () {
    const {
      feedbackType,
      limit = DEFAULT_PAGE_SIZE,
      page = 1,
      projectId,
      search,
      status,
      subjectUserId
    } = this.args
    const auth = this.context.auth
    const parsedPage = Number(page)
    const parsedLimit = Math.min(Number(limit), MAX_PAGE_SIZE)
    const scope = await getFeedbackScopeWhere(auth, this.dbTransaction)
    const feedback = await ProjectFeedback.findAll({
      where: scope,
      include: feedbackInclude,
      order: [['updatedAt', 'DESC']],
      transaction: this.dbTransaction
    })
    const allItems = feedback.map(serializeFeedback)
    const normalizedSearch = search?.trim().toLowerCase()
    const filtered = allItems.filter(item => {
      if (status && item.status !== status) return false
      if (projectId && item.projectId !== projectId) return false
      if (subjectUserId && item.subject.id !== subjectUserId) return false
      if (feedbackType && item.feedbackType !== feedbackType) return false
      if (!normalizedSearch) return true

      return [
        item.subject.fullName,
        item.subject.email,
        item.subject.employeeCode,
        item.subject.jobTitle,
        item.author.fullName,
        item.project?.name,
        item.project?.code,
        item.reviewPeriod,
        item.summary
      ]
        .filter(Boolean)
        .some(value => value.toLowerCase().includes(normalizedSearch))
    })
    const publishedItems = allItems.filter(item =>
      ['published', 'acknowledged'].includes(item.status)
    )
    const ratedItems = publishedItems.filter(
      item => item.ratings.overall !== null
    )
    const offset = (parsedPage - 1) * parsedLimit

    return {
      items: filtered.slice(offset, offset + parsedLimit),
      pagination: {
        limit: parsedLimit,
        page: parsedPage,
        total: filtered.length,
        totalPages: Math.ceil(filtered.length / parsedLimit)
      },
      summary: {
        published: publishedItems.length,
        drafts: allItems.filter(item => item.status === 'draft').length,
        awaitingAcknowledgement: allItems.filter(
          item =>
            item.status === 'published' &&
            item.visibility === 'employee_and_managers'
        ).length,
        acknowledged: allItems.filter(
          item => item.status === 'acknowledged'
        ).length,
        averageRating: ratedItems.length
          ? Number(
              (
                ratedItems.reduce(
                  (total, item) => total + item.ratings.overall,
                  0
                ) / ratedItems.length
              ).toFixed(1)
            )
          : null
      },
      permissions: {
        canManage: hasPermission(
          auth,
          'feedback:write',
          'feedback:write:assigned'
        )
      }
    }
  }
}

export default ListFeedbackService
