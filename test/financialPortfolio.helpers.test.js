import {
  buildMonthlyTrend,
  getProjectFinancialStatus,
  sumBillingRecords,
  withFinancialPercentages
} from '@src/services/financials/financialPortfolio.helpers'

const record = (overrides = {}) => ({
  amountInvoiced: 100,
  amountCollected: 80,
  approvedInternalCost: 50,
  otherExpenses: 5,
  outstandingAmount: 20,
  estimatedGrossMargin: 45,
  estimatedCashContribution: 25,
  periodStart: '2026-07-01',
  status: 'part_paid',
  ...overrides
})

describe('financial portfolio helpers', () => {
  test('aggregates billing totals and calculates portfolio percentages', () => {
    const totals = withFinancialPercentages(
      sumBillingRecords([
        record(),
        record({
          amountInvoiced: 200,
          amountCollected: 200,
          outstandingAmount: 0,
          estimatedGrossMargin: 90
        })
      ])
    )

    expect(totals.amountInvoiced).toBe(300)
    expect(totals.amountCollected).toBe(280)
    expect(totals.collectionRate).toBe(93.33)
    expect(totals.estimatedMarginPercentage).toBe(45)
  })

  test('prioritizes past-due exposure over other project states', () => {
    expect(
      getProjectFinancialStatus(
        { id: 'contract' },
        [
          record(),
          record({
            status: 'past_due'
          })
        ]
      )
    ).toBe('past_due')
  })

  test('builds a six-month invoiced and collected trend', () => {
    const trend = buildMonthlyTrend(
      [
        record(),
        record({
          amountInvoiced: 50,
          amountCollected: 40,
          periodStart: '2026-06-01'
        })
      ],
      6,
      new Date('2026-07-30T00:00:00Z')
    )

    expect(trend).toHaveLength(6)
    expect(trend.find(period => period.key === '2026-07')).toMatchObject({
      amountInvoiced: 100,
      amountCollected: 80
    })
  })
})
