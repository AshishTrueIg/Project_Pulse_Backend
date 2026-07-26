import { Op } from 'sequelize'

import { Project } from '@src/db/models'
import BaseHandler from '@src/libs/baseHandler'

import {
  getScopedProjectWhere,
  projectIncludes,
  serializeProjectListItem
} from './project.helpers'

const DEFAULT_PAGE_SIZE = 20
const MAX_PAGE_SIZE = 100
const STALE_AFTER_DAYS = 7

class ListProjectsService extends BaseHandler {
  async run () {
    const {
      health,
      limit = DEFAULT_PAGE_SIZE,
      page = 1,
      search,
      stage,
      status
    } = this.args
    const parsedPage = Number(page)
    const parsedLimit = Math.min(Number(limit), MAX_PAGE_SIZE)
    const scope = await getScopedProjectWhere(
      this.context.auth,
      this.dbTransaction
    )
    const where = {
      ...scope
    }

    if (health) where.overallHealth = health
    if (stage) where.stage = stage
    if (status) where.status = status

    if (search) {
      where[Op.or] = [
        {
          name: {
            [Op.iLike]: `%${search.trim()}%`
          }
        },
        {
          code: {
            [Op.iLike]: `%${search.trim()}%`
          }
        }
      ]
    }

    const [total, projects, visibleProjects] = await Promise.all([
      Project.count({
        where,
        transaction: this.dbTransaction
      }),
      Project.findAll({
        where,
        include: projectIncludes,
        limit: parsedLimit,
        offset: (parsedPage - 1) * parsedLimit,
        order: [['name', 'ASC']],
        subQuery: true,
        transaction: this.dbTransaction
      }),
      Project.findAll({
        where: {
          ...scope,
          status: 'active'
        },
        attributes: ['id', 'overallHealth', 'lastHealthUpdatedAt'],
        transaction: this.dbTransaction
      })
    ])

    const staleThreshold = new Date(
      Date.now() - STALE_AFTER_DAYS * 24 * 60 * 60 * 1000
    )

    return {
      items: projects.map(serializeProjectListItem),
      pagination: {
        limit: parsedLimit,
        page: parsedPage,
        total,
        totalPages: Math.ceil(total / parsedLimit)
      },
      summary: {
        active: visibleProjects.length,
        healthy: visibleProjects.filter(
          project => project.overallHealth === 'green'
        ).length,
        needsAttention: visibleProjects.filter(
          project => project.overallHealth === 'amber'
        ).length,
        critical: visibleProjects.filter(
          project => project.overallHealth === 'red'
        ).length,
        stale: visibleProjects.filter(
          project =>
            !project.lastHealthUpdatedAt ||
            project.lastHealthUpdatedAt < staleThreshold
        ).length
      }
    }
  }
}

export default ListProjectsService
