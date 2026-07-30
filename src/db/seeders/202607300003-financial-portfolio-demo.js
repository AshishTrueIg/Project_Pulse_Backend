const ids = {
  organization: '10000000-0000-4000-8000-000000000001',
  projects: {
    nexus: '50000000-0000-4000-8000-000000000002',
    coreBank: '50000000-0000-4000-8000-000000000003',
    verde: '50000000-0000-4000-8000-000000000004'
  },
  contracts: {
    nexus: '91000000-0000-4000-8000-000000000002',
    coreBank: '91000000-0000-4000-8000-000000000003',
    verde: '91000000-0000-4000-8000-000000000004'
  }
}

const contractIds = Object.values(ids.contracts)
const billingIds = Array.from(
  { length: 8 },
  (_, index) => `92000000-0000-4000-8000-${String(index + 4).padStart(12, '0')}`
)
const now = new Date()
const withTimestamps = row => ({
  ...row,
  created_at: now,
  updated_at: now
})

const billingRecord = ({
  amountCollected,
  amountInvoiced,
  approvedInternalCost,
  contractId,
  expectedPaymentDate,
  id,
  invoiceReference,
  notes = null,
  otherExpenses,
  periodEnd,
  periodStart,
  projectId,
  status
}) =>
  withTimestamps({
    id,
    organization_id: ids.organization,
    project_id: projectId,
    contract_id: contractId,
    invoice_reference: invoiceReference,
    period_start: periodStart,
    period_end: periodEnd,
    amount_invoiced: amountInvoiced,
    amount_collected: amountCollected,
    approved_internal_cost: approvedInternalCost,
    other_expenses: otherExpenses,
    expected_payment_date: expectedPaymentDate,
    status,
    notes
  })

export const up = async queryInterface => {
  const [projects] = await queryInterface.sequelize.query(
    'SELECT id FROM projects WHERE id = :projectId LIMIT 1',
    {
      replacements: {
        projectId: ids.projects.nexus
      }
    }
  )

  if (!projects.length) return

  const [existing] = await queryInterface.sequelize.query(
    'SELECT id FROM project_contracts WHERE id = :contractId LIMIT 1',
    {
      replacements: {
        contractId: ids.contracts.nexus
      }
    }
  )

  if (existing.length) return

  await queryInterface.bulkInsert('project_contracts', [
    withTimestamps({
      id: ids.contracts.nexus,
      organization_id: ids.organization,
      project_id: ids.projects.nexus,
      contract_type: 'time_and_material',
      start_date: '2026-04-01',
      end_date: null,
      billing_frequency: 'monthly',
      currency: 'INR',
      agreed_amount: 360000,
      notes: 'Monthly time-and-material billing against approved delivery capacity.'
    }),
    withTimestamps({
      id: ids.contracts.coreBank,
      organization_id: ids.organization,
      project_id: ids.projects.coreBank,
      contract_type: 'dedicated_monthly',
      start_date: '2026-02-01',
      end_date: null,
      billing_frequency: 'monthly',
      currency: 'INR',
      agreed_amount: 420000,
      notes: 'Dedicated mobile, backend and compliance QA delivery team.'
    }),
    withTimestamps({
      id: ids.contracts.verde,
      organization_id: ids.organization,
      project_id: ids.projects.verde,
      contract_type: 'maintenance_retainer',
      start_date: '2026-01-01',
      end_date: null,
      billing_frequency: 'monthly',
      currency: 'INR',
      agreed_amount: 180000,
      notes: 'Ongoing reliability, release and workflow improvement retainer.'
    })
  ])

  await queryInterface.bulkInsert('billing_records', [
    billingRecord({
      id: billingIds[0],
      projectId: ids.projects.nexus,
      contractId: ids.contracts.nexus,
      invoiceReference: 'NXC-2026-05',
      periodStart: '2026-05-01',
      periodEnd: '2026-05-31',
      amountInvoiced: 340000,
      amountCollected: 340000,
      approvedInternalCost: 228000,
      otherExpenses: 7000,
      expectedPaymentDate: '2026-06-12',
      status: 'paid'
    }),
    billingRecord({
      id: billingIds[1],
      projectId: ids.projects.nexus,
      contractId: ids.contracts.nexus,
      invoiceReference: 'NXC-2026-06',
      periodStart: '2026-06-01',
      periodEnd: '2026-06-30',
      amountInvoiced: 360000,
      amountCollected: 180000,
      approvedInternalCost: 236000,
      otherExpenses: 9000,
      expectedPaymentDate: '2026-07-12',
      status: 'part_paid',
      notes: 'Balance is overdue and under follow-up with the client finance team.'
    }),
    billingRecord({
      id: billingIds[2],
      projectId: ids.projects.nexus,
      contractId: ids.contracts.nexus,
      invoiceReference: 'NXC-2026-07',
      periodStart: '2026-07-01',
      periodEnd: '2026-07-31',
      amountInvoiced: 360000,
      amountCollected: 0,
      approvedInternalCost: 240000,
      otherExpenses: 6000,
      expectedPaymentDate: '2026-08-12',
      status: 'pending'
    }),
    billingRecord({
      id: billingIds[3],
      projectId: ids.projects.coreBank,
      contractId: ids.contracts.coreBank,
      invoiceReference: 'CBM-2026-05',
      periodStart: '2026-05-01',
      periodEnd: '2026-05-31',
      amountInvoiced: 420000,
      amountCollected: 420000,
      approvedInternalCost: 294000,
      otherExpenses: 11000,
      expectedPaymentDate: '2026-06-10',
      status: 'paid'
    }),
    billingRecord({
      id: billingIds[4],
      projectId: ids.projects.coreBank,
      contractId: ids.contracts.coreBank,
      invoiceReference: 'CBM-2026-06',
      periodStart: '2026-06-01',
      periodEnd: '2026-06-30',
      amountInvoiced: 420000,
      amountCollected: 420000,
      approvedInternalCost: 298000,
      otherExpenses: 9000,
      expectedPaymentDate: '2026-07-10',
      status: 'paid'
    }),
    billingRecord({
      id: billingIds[5],
      projectId: ids.projects.coreBank,
      contractId: ids.contracts.coreBank,
      invoiceReference: 'CBM-2026-07',
      periodStart: '2026-07-01',
      periodEnd: '2026-07-31',
      amountInvoiced: 420000,
      amountCollected: 250000,
      approvedInternalCost: 302000,
      otherExpenses: 14000,
      expectedPaymentDate: '2026-08-10',
      status: 'part_paid'
    }),
    billingRecord({
      id: billingIds[6],
      projectId: ids.projects.verde,
      contractId: ids.contracts.verde,
      invoiceReference: 'VOP-2026-06',
      periodStart: '2026-06-01',
      periodEnd: '2026-06-30',
      amountInvoiced: 180000,
      amountCollected: 180000,
      approvedInternalCost: 98000,
      otherExpenses: 4000,
      expectedPaymentDate: '2026-07-08',
      status: 'paid'
    }),
    billingRecord({
      id: billingIds[7],
      projectId: ids.projects.verde,
      contractId: ids.contracts.verde,
      invoiceReference: 'VOP-2026-07',
      periodStart: '2026-07-01',
      periodEnd: '2026-07-31',
      amountInvoiced: 180000,
      amountCollected: 180000,
      approvedInternalCost: 101000,
      otherExpenses: 5000,
      expectedPaymentDate: '2026-08-08',
      status: 'paid'
    })
  ])
}

export const down = async queryInterface => {
  await queryInterface.bulkDelete('billing_records', {
    id: billingIds
  })
  await queryInterface.bulkDelete('project_contracts', {
    id: contractIds
  })
}
