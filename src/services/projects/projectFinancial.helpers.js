const toMoney = value => Number(value || 0)

const getBillingStatus = record => {
  const invoiced = toMoney(record.amountInvoiced)
  const collected = toMoney(record.amountCollected)
  const outstanding = Math.max(0, invoiced - collected)
  const expectedPaymentDate = record.expectedPaymentDate
    ? new Date(`${record.expectedPaymentDate}T23:59:59Z`)
    : null

  if (invoiced > 0 && outstanding <= 0) return 'paid'
  if (
    outstanding > 0 &&
    expectedPaymentDate &&
    expectedPaymentDate.getTime() < Date.now()
  ) {
    return 'past_due'
  }
  if (collected > 0) return 'part_paid'

  return 'pending'
}

const serializeBillingRecord = record => {
  const amountInvoiced = toMoney(record.amountInvoiced)
  const amountCollected = toMoney(record.amountCollected)
  const approvedInternalCost = toMoney(record.approvedInternalCost)
  const otherExpenses = toMoney(record.otherExpenses)
  const outstandingAmount = Math.max(0, amountInvoiced - amountCollected)
  const estimatedGrossMargin =
    amountInvoiced - approvedInternalCost - otherExpenses
  const estimatedCashContribution =
    amountCollected - approvedInternalCost - otherExpenses

  return {
    id: record.id,
    invoiceReference: record.invoiceReference,
    periodStart: record.periodStart,
    periodEnd: record.periodEnd,
    amountInvoiced,
    amountCollected,
    approvedInternalCost,
    otherExpenses,
    outstandingAmount,
    estimatedGrossMargin,
    estimatedCashContribution,
    estimatedMarginPercentage: amountInvoiced
      ? Math.round((estimatedGrossMargin / amountInvoiced) * 10000) / 100
      : 0,
    expectedPaymentDate: record.expectedPaymentDate,
    status: getBillingStatus(record),
    notes: record.notes,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt
  }
}

export { getBillingStatus, serializeBillingRecord, toMoney }
