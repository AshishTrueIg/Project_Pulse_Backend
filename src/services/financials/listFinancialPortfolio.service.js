import {
  BillingRecord,
  Client,
  Organization,
  Project,
  ProjectContract,
  User
} from '@src/db/models'
import BaseHandler from '@src/libs/baseHandler'

import {
  buildMonthlyTrend,
  serializeFinancialProject,
  sortFinancialProjects,
  sumBillingRecords,
  withFinancialPercentages
} from './financialPortfolio.helpers'

class ListFinancialPortfolioService extends BaseHandler {
  async run () {
    const {
      contractType,
      financialStatus,
      projectId,
      search
    } = this.args
    const auth = this.context.auth
    const [organization, projects] = await Promise.all([
      Organization.findByPk(auth.organizationId, {
        attributes: ['id', 'currency'],
        transaction: this.dbTransaction
      }),
      Project.findAll({
        where: {
          organizationId: auth.organizationId
        },
        attributes: ['id', 'code', 'name', 'stage', 'status'],
        include: [
          {
            model: Client,
            as: 'client',
            attributes: ['id', 'name']
          },
          {
            model: User,
            as: 'manager',
            attributes: ['id', 'fullName']
          },
          {
            model: ProjectContract,
            as: 'contract',
            required: false
          },
          {
            model: BillingRecord,
            as: 'billingRecords',
            required: false
          }
        ],
        order: [['name', 'ASC']],
        transaction: this.dbTransaction
      })
    ])
    const allProjects = projects.map(serializeFinancialProject)
    const normalizedSearch = search?.trim().toLowerCase()
    const filtered = allProjects.filter(project => {
      if (projectId && project.id !== projectId) return false
      if (financialStatus && project.financialStatus !== financialStatus) {
        return false
      }
      if (contractType && project.contract?.contractType !== contractType) {
        return false
      }
      if (!normalizedSearch) return true

      return [
        project.name,
        project.code,
        project.client.name,
        project.manager.fullName,
        project.contract?.contractType
      ]
        .filter(Boolean)
        .some(value => value.toLowerCase().includes(normalizedSearch))
    })
    const allRecords = allProjects.flatMap(project => project.records)
    const totals = withFinancialPercentages(sumBillingRecords(allRecords))
    const recentRecords = sortFinancialProjects(filtered)
      .flatMap(project =>
        project.records.map(record => ({
          ...record,
          project: {
            id: project.id,
            code: project.code,
            name: project.name
          },
          currency: project.contract?.currency || organization?.currency || 'INR'
        }))
      )
      .sort((left, right) => right.periodStart.localeCompare(left.periodStart))
      .slice(0, 12)
    const contractTypes = [
      ...new Set(
        allProjects
          .map(project => project.contract?.contractType)
          .filter(Boolean)
      )
    ].sort()

    return {
      currency: organization?.currency || 'INR',
      disclaimer:
        'Management estimates only; figures are not accounting statements or recognized revenue.',
      filters: {
        contractTypes,
        financialStatuses: [
          'healthy',
          'outstanding',
          'past_due',
          'no_billing',
          'no_contract'
        ],
        projects: allProjects.map(project => ({
          id: project.id,
          code: project.code,
          name: project.name
        }))
      },
      projects: sortFinancialProjects(filtered).map(project => ({
        ...project,
        records: undefined
      })),
      recentRecords,
      summary: {
        ...totals,
        activeContracts: allProjects.filter(project => project.contract).length,
        projectsWithoutContract: allProjects.filter(project => !project.contract).length,
        projectsWithPastDue: allProjects.filter(
          project => project.financialStatus === 'past_due'
        ).length,
        totalProjects: allProjects.length
      },
      trend: buildMonthlyTrend(allRecords)
    }
  }
}

export default ListFinancialPortfolioService
