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
        include: [
          {
            model: Role,
            as: 'roles',
            attributes: ['id', 'name'],
            through: {
              attributes: []
            }
          }
        ],
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
      managers: managers.filter(user =>
        user.roles.some(role =>
          ['owner', 'manager', 'team_lead'].includes(role.name)
        )
      ),
      projects,
      roles,
      invitationRoles: roles.filter(role =>
        ['manager', 'team_lead', 'employee'].includes(role.name)
      ),
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
