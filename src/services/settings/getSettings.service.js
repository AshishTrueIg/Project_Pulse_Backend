import {
  Organization,
  Project,
  Role,
  User
} from '@src/db/models'
import BaseHandler from '@src/libs/baseHandler'

import { hasPermission } from '../projects/projectMutation.helpers'
import { normalizeHealthPolicy } from '../projects/projectHealth.helpers'
import { serializeRole } from './settings.helpers'

class GetSettingsService extends BaseHandler {
  async run () {
    const auth = this.context.auth
    const [organization, roles, projects] = await Promise.all([
      Organization.findByPk(auth.organizationId, {
        transaction: this.dbTransaction
      }),
      Role.findAll({
        where: {
          organizationId: auth.organizationId
        },
        include: [
          {
            model: User,
            as: 'users',
            attributes: ['id'],
            through: {
              attributes: []
            }
          }
        ],
        order: [['name', 'ASC']],
        transaction: this.dbTransaction
      }),
      Project.findAll({
        where: {
          organizationId: auth.organizationId,
          status: 'active'
        },
        attributes: [
          'id',
          'code',
          'name',
          'overallHealth',
          'managerHealthAssessment',
          'healthScore',
          'healthBreakdown'
        ],
        order: [
          ['healthScore', 'ASC'],
          ['name', 'ASC']
        ],
        limit: 8,
        transaction: this.dbTransaction
      })
    ])

    return {
      organization: {
        id: organization.id,
        name: organization.name,
        slug: organization.slug,
        timezone: organization.timezone,
        currency: organization.currency,
        reportingCadenceDays: organization.reportingCadenceDays
      },
      healthPolicy: normalizeHealthPolicy(organization.healthPolicy),
      healthPreview: projects.map(project => ({
        id: project.id,
        code: project.code,
        name: project.name,
        health: project.overallHealth,
        managerAssessment: project.managerHealthAssessment,
        score: project.healthScore,
        breakdown: project.healthBreakdown
      })),
      roles: roles.map(serializeRole),
      permissions: {
        canWrite: hasPermission(auth, 'settings:write'),
        canViewActivity: hasPermission(auth, 'audit:read')
      }
    }
  }
}

export default GetSettingsService
