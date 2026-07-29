import { User } from '@src/db/models'
import BaseHandler from '@src/libs/baseHandler'

import {
  getPeopleScopeWhere,
  personIncludes,
  serializePerson
} from './people.helpers'

const DEFAULT_PAGE_SIZE = 12
const MAX_PAGE_SIZE = 100

class ListPeopleService extends BaseHandler {
  async run () {
    const {
      limit = DEFAULT_PAGE_SIZE,
      page = 1,
      projectId,
      role,
      search,
      status = 'active',
      workload
    } = this.args
    const parsedPage = Number(page)
    const parsedLimit = Math.min(Number(limit), MAX_PAGE_SIZE)
    const scope = await getPeopleScopeWhere(
      this.context.auth,
      this.dbTransaction
    )
    const people = await User.findAll({
      where: scope,
      include: personIncludes,
      order: [['fullName', 'ASC']],
      transaction: this.dbTransaction
    })
    const serialized = people.map(serializePerson)
    const activePeople = serialized.filter(person => person.status === 'active')
    const normalizedSearch = search?.trim().toLowerCase()
    const filtered = serialized.filter(person => {
      if (status && person.status !== status) return false
      if (role && !person.roles.some(item => item.name === role)) return false
      if (workload && person.workloadSignal !== workload) return false
      if (
        projectId &&
        !person.projects.some(assignment => assignment.project.id === projectId)
      ) {
        return false
      }

      if (!normalizedSearch) return true

      return [
        person.fullName,
        person.email,
        person.employeeCode,
        person.jobTitle,
        ...person.skills
      ]
        .filter(Boolean)
        .some(value => value.toLowerCase().includes(normalizedSearch))
    })
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
        active: activePeople.length,
        managers: activePeople.filter(person =>
          person.roles.some(roleItem =>
            ['manager', 'team_lead', 'owner'].includes(roleItem.name)
          )
        ).length,
        allocated: activePeople.filter(person => person.activeProjects > 0).length,
        capacityAlerts: activePeople.filter(person =>
          ['heavy', 'overloaded'].includes(person.workloadSignal)
        ).length
      }
    }
  }
}

export default ListPeopleService
