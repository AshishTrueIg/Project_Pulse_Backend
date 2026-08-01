import { AuditLog, User } from '@src/db/models'
import BaseHandler from '@src/libs/baseHandler'

import { serializeActivity } from './settings.helpers'

const DEFAULT_PAGE_SIZE = 20
const MAX_PAGE_SIZE = 100
const MAX_ACTIVITY_SCAN = 1000

class ListActivityService extends BaseHandler {
  async run () {
    const {
      action,
      entityType,
      limit = DEFAULT_PAGE_SIZE,
      page = 1,
      search
    } = this.args
    const parsedPage = Number(page)
    const parsedLimit = Math.min(Number(limit), MAX_PAGE_SIZE)
    const activity = await AuditLog.findAll({
      where: {
        organizationId: this.context.auth.organizationId
      },
      include: [
        {
          model: User,
          as: 'actor',
          attributes: ['id', 'fullName', 'email'],
          required: false
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: MAX_ACTIVITY_SCAN,
      transaction: this.dbTransaction
    })
    const normalizedSearch = search?.trim().toLowerCase()
    const filtered = activity
      .filter(item => !action || item.action === action)
      .filter(item => !entityType || item.entityType === entityType)
      .filter(item => {
        if (!normalizedSearch) return true

        return [
          item.action,
          item.entityType,
          item.actor?.fullName,
          item.actor?.email,
          item.afterValue?.name,
          item.afterValue?.title,
          item.beforeValue?.name,
          item.beforeValue?.title
        ]
          .filter(Boolean)
          .some(value => value.toLowerCase().includes(normalizedSearch))
      })
    const start = (parsedPage - 1) * parsedLimit
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000

    return {
      items: filtered
        .slice(start, start + parsedLimit)
        .map(serializeActivity),
      pagination: {
        limit: parsedLimit,
        page: parsedPage,
        total: filtered.length,
        totalPages: Math.ceil(filtered.length / parsedLimit)
      },
      summary: {
        last24Hours: activity.filter(
          item => new Date(item.createdAt).getTime() >= oneDayAgo
        ).length,
        total: activity.length
      },
      filters: {
        actions: [...new Set(activity.map(item => item.action))].sort(),
        entityTypes: [
          ...new Set(activity.map(item => item.entityType))
        ].sort()
      }
    }
  }
}

export default ListActivityService
