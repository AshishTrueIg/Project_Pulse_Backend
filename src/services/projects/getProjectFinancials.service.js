import {
  BillingRecord,
  ProjectContract
} from '@src/db/models'
import BaseHandler from '@src/libs/baseHandler'

import { serializeBillingRecord } from './projectFinancial.helpers'
import { getProjectForRead } from './projectRead.helpers'

class GetProjectFinancialsService extends BaseHandler {
  async run () {
    const { projectId } = this.args
    const auth = this.context.auth

    await getProjectForRead(projectId, auth, this.dbTransaction)

    const [contract, records] = await Promise.all([
      ProjectContract.findOne({
        where: {
          organizationId: auth.organizationId,
          projectId
        },
        transaction: this.dbTransaction
      }),
      BillingRecord.findAll({
        where: {
          organizationId: auth.organizationId,
          projectId
        },
        order: [['periodStart', 'DESC']],
        transaction: this.dbTransaction
      })
    ])
    const items = records.map(serializeBillingRecord)
    const totals = items.reduce(
      (result, record) => ({
        amountInvoiced: result.amountInvoiced + record.amountInvoiced,
        amountCollected: result.amountCollected + record.amountCollected,
        approvedInternalCost:
          result.approvedInternalCost + record.approvedInternalCost,
        otherExpenses: result.otherExpenses + record.otherExpenses,
        outstandingAmount:
          result.outstandingAmount + record.outstandingAmount,
        estimatedGrossMargin:
          result.estimatedGrossMargin + record.estimatedGrossMargin,
        estimatedCashContribution:
          result.estimatedCashContribution + record.estimatedCashContribution
      }),
      {
        amountInvoiced: 0,
        amountCollected: 0,
        approvedInternalCost: 0,
        otherExpenses: 0,
        outstandingAmount: 0,
        estimatedGrossMargin: 0,
        estimatedCashContribution: 0
      }
    )

    return {
      contract: contract
        ? {
            id: contract.id,
            contractType: contract.contractType,
            startDate: contract.startDate,
            endDate: contract.endDate,
            billingFrequency: contract.billingFrequency,
            currency: contract.currency,
            agreedAmount: Number(contract.agreedAmount),
            notes: contract.notes
          }
        : null,
      records: items,
      totals: {
        ...totals,
        estimatedMarginPercentage: totals.amountInvoiced
          ? Math.round(
              (totals.estimatedGrossMargin / totals.amountInvoiced) * 10000
            ) / 100
          : 0
      },
      disclaimer:
        'Management estimates only; these figures are not accounting statements or recognized revenue.'
    }
  }
}

export default GetProjectFinancialsService
