import { Project, Role, User } from '@src/db/models'
import BaseHandler from '@src/libs/baseHandler'

class GetPeopleOptionsService extends BaseHandler {
  async run () {
    const { organizationId } = this.context.auth
    const [managers, projects, roles] = await Promise.all([
      User.findAll({
        where: {
          organizationId,
          status: 'active'
        },
        attributes: ['id', 'fullName', 'email', 'jobTitle'],
        order: [['fullName', 'ASC']],
        transaction: this.dbTransaction
      }),
      Project.findAll({
        where: {
          organizationId,
          status: 'active'
        },
        attributes: ['id', 'code', 'name'],
        order: [['name', 'ASC']],
        transaction: this.dbTransaction
      }),
      Role.findAll({
        where: {
          organizationId
        },
        attributes: ['id', 'name'],
        order: [['name', 'ASC']],
        transaction: this.dbTransaction
      })
    ])

    return {
      managers,
      projects,
      roles,
      statuses: ['active', 'inactive'],
      workloadSignals: [
        'unallocated',
        'light',
        'normal',
        'heavy',
        'overloaded'
      ]
    }
  }
}

export default GetPeopleOptionsService
