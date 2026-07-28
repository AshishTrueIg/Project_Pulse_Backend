import { Client, User } from '@src/db/models'
import BaseHandler from '@src/libs/baseHandler'

const stages = [
  'draft',
  'planning',
  'active_development',
  'mvp_review',
  'scope_completed',
  'maintenance_retainer',
  'closed',
  'on_hold'
]

const statuses = ['active', 'upcoming', 'on_hold', 'maintenance', 'completed']

class GetProjectOptionsService extends BaseHandler {
  async run () {
    const { organizationId } = this.context.auth
    const [clients, users] = await Promise.all([
      Client.findAll({
        where: {
          organizationId,
          status: 'active'
        },
        attributes: ['id', 'name'],
        order: [['name', 'ASC']],
        transaction: this.dbTransaction
      }),
      User.findAll({
        where: {
          organizationId,
          status: 'active'
        },
        attributes: ['id', 'fullName', 'email', 'jobTitle'],
        order: [['fullName', 'ASC']],
        transaction: this.dbTransaction
      })
    ])

    return {
      clients,
      users,
      stages,
      statuses,
      healthStates: ['green', 'amber', 'red', 'not_assessed'],
      milestoneStatuses: [
        'planned',
        'in_progress',
        'ready_for_review',
        'changes_requested',
        'completed',
        'accepted'
      ],
      riskStatuses: ['open', 'mitigating', 'resolved', 'accepted'],
      workloadSignals: ['light', 'normal', 'heavy', 'overloaded']
    }
  }
}

export default GetProjectOptionsService
