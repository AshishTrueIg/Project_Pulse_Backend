import {
  getBillingStatus,
  serializeBillingRecord
} from '@src/services/projects/projectFinancial.helpers'

const createRecord = overrides => ({
  id: 'billing-1',
  invoiceReference: 'INV-001',
  periodStart: '2026-07-01',
  periodEnd: '2026-07-31',
  amountInvoiced: '100000.00',
  amountCollected: '60000.00',
  approvedInternalCost: '30000.00',
  otherExpenses: '5000.00',
  expectedPaymentDate: '2099-08-10',
  notes: null,
  createdAt: new Date('2026-07-01T00:00:00Z'),
  updatedAt: new Date('2026-07-01T00:00:00Z'),
  ...overrides
})

describe('project financial calculations', () => {
  it('calculates outstanding, contribution and estimated margin server-side', () => {
    const result = serializeBillingRecord(createRecord())

    expect(result).toEqual(
      expect.objectContaining({
        amountCollected: 60000,
        amountInvoiced: 100000,
        estimatedCashContribution: 25000,
        estimatedGrossMargin: 65000,
        estimatedMarginPercentage: 65,
        outstandingAmount: 40000,
        status: 'part_paid'
      })
    )
  })

  it('marks a settled invoice as paid', () => {
    expect(
      getBillingStatus(
        createRecord({
          amountCollected: '100000.00'
        })
      )
    ).toBe('paid')
  })

  it('marks an overdue outstanding invoice as past due', () => {
    expect(
      getBillingStatus(
        createRecord({
          amountCollected: '0.00',
          expectedPaymentDate: '2020-01-01'
        })
      )
    ).toBe('past_due')
  })
})
