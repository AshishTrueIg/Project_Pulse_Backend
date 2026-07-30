import { serializeBillingRecord } from '../projects/projectFinancial.helpers'

const FINANCIAL_STATUS_PRIORITY = {
  past_due: 0,
  outstanding: 1,
  no_contract: 2,
  no_billing: 3,
  healthy: 4
}

const emptyTotals = () => ({
  amountInvoiced: 0,
  amountCollected: 0,
  approvedInternalCost: 0,
  otherExpenses: 0,
  outstandingAmount: 0,
  overdueAmount: 0,
  estimatedGrossMargin: 0,
  estimatedCashContribution: 0
})

const sumBillingRecords = records =>
  records.reduce((totals, record) => ({
    amountInvoiced: totals.amountInvoiced + record.amountInvoiced,
    amountCollected: totals.amountCollected + record.amountCollected,
    approvedInternalCost:
      totals.approvedInternalCost + record.approvedInternalCost,
    otherExpenses: totals.otherExpenses + record.otherExpenses,
    outstandingAmount: totals.outstandingAmount + record.outstandingAmount,
    overdueAmount:
      totals.overdueAmount +
      (record.status === 'past_due' ? record.outstandingAmount : 0),
    estimatedGrossMargin:
      totals.estimatedGrossMargin + record.estimatedGrossMargin,
    estimatedCashContribution:
      totals.estimatedCashContribution + record.estimatedCashContribution
  }), emptyTotals())

const withFinancialPercentages = totals => ({
  ...totals,
  collectionRate: totals.amountInvoiced
    ? Math.round((totals.amountCollected / totals.amountInvoiced) * 10000) / 100
    : 0,
  estimatedMarginPercentage: totals.amountInvoiced
    ? Math.round(
        (totals.estimatedGrossMargin / totals.amountInvoiced) * 10000
      ) / 100
    : 0
})

const getProjectFinancialStatus = (contract, records) => {
  if (!contract) return 'no_contract'
  if (!records.length) return 'no_billing'
  if (records.some(record => record.status === 'past_due')) return 'past_due'
  if (records.some(record => record.outstandingAmount > 0)) return 'outstanding'

  return 'healthy'
}

const serializeFinancialProject = project => {
  const records = project.billingRecords
    .map(serializeBillingRecord)
    .sort((left, right) => right.periodStart.localeCompare(left.periodStart))
  const totals = withFinancialPercentages(sumBillingRecords(records))
  const contract = project.contract
    ? {
        id: project.contract.id,
        contractType: project.contract.contractType,
        startDate: project.contract.startDate,
        endDate: project.contract.endDate,
        billingFrequency: project.contract.billingFrequency,
        currency: project.contract.currency,
        agreedAmount: Number(project.contract.agreedAmount),
        notes: project.contract.notes
      }
    : null

  return {
    id: project.id,
    code: project.code,
    name: project.name,
    stage: project.stage,
    status: project.status,
    client: {
      id: project.client.id,
      name: project.client.name
    },
    manager: {
      id: project.manager.id,
      fullName: project.manager.fullName
    },
    contract,
    financialStatus: getProjectFinancialStatus(contract, records),
    totals,
    invoiceCount: records.length,
    latestRecord: records[0] || null,
    records
  }
}

const buildMonthlyTrend = (records, months = 6, now = new Date()) => {
  const periods = []

  for (let offset = months - 1; offset >= 0; offset -= 1) {
    const date = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth() - offset,
      1
    ))
    const key = date.toISOString().slice(0, 7)

    periods.push({
      key,
      label: date.toLocaleDateString('en-IN', {
        month: 'short',
        timeZone: 'UTC'
      }),
      amountInvoiced: 0,
      amountCollected: 0
    })
  }

  const periodByKey = new Map(periods.map(period => [period.key, period]))

  records.forEach(record => {
    const period = periodByKey.get(record.periodStart.slice(0, 7))

    if (!period) return

    period.amountInvoiced += record.amountInvoiced
    period.amountCollected += record.amountCollected
  })

  return periods
}

const sortFinancialProjects = projects =>
  [...projects].sort((left, right) => {
    const priorityDifference =
      FINANCIAL_STATUS_PRIORITY[left.financialStatus] -
      FINANCIAL_STATUS_PRIORITY[right.financialStatus]

    return priorityDifference || left.name.localeCompare(right.name)
  })

export {
  buildMonthlyTrend,
  emptyTotals,
  getProjectFinancialStatus,
  serializeFinancialProject,
  sortFinancialProjects,
  sumBillingRecords,
  withFinancialPercentages
}
