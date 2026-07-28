const ids = {
  organization: '10000000-0000-4000-8000-000000000001',
  project: '50000000-0000-4000-8000-000000000001',
  manager: '30000000-0000-4000-8000-000000000001',
  aarav: '30000000-0000-4000-8000-000000000002',
  sana: '30000000-0000-4000-8000-000000000004',
  feedbackPublished: '90000000-0000-4000-8000-000000000001',
  feedbackDraft: '90000000-0000-4000-8000-000000000002',
  contract: '91000000-0000-4000-8000-000000000001'
}

const now = new Date()
const withTimestamps = row => ({
  ...row,
  created_at: now,
  updated_at: now
})

export const up = async queryInterface => {
  const [projects] = await queryInterface.sequelize.query(
    'SELECT id FROM projects WHERE id = :projectId LIMIT 1',
    {
      replacements: {
        projectId: ids.project
      }
    }
  )

  if (!projects.length) return

  const [existingFeedback] = await queryInterface.sequelize.query(
    'SELECT id FROM project_feedback WHERE id = :feedbackId LIMIT 1',
    {
      replacements: {
        feedbackId: ids.feedbackPublished
      }
    }
  )

  if (!existingFeedback.length) {
    await queryInterface.bulkInsert('project_feedback', [
      withTimestamps({
        id: ids.feedbackPublished,
        organization_id: ids.organization,
        project_id: ids.project,
        subject_user_id: ids.aarav,
        author_user_id: ids.manager,
        feedback_type: 'manager',
        review_period: 'July 2026',
        summary:
          'A strong month of technical ownership, dependable delivery and clear collaboration across the team.',
        strengths:
          'Owned frontend architecture decisions.\nExplained complex trade-offs clearly to the client.\nDelivered agreed outcomes with consistent quality.',
        improvement_areas:
          'Delegate earlier during high-pressure weeks so ownership is distributed across the team.',
        goals:
          'Delegate two feature areas in the next MVP and schedule short design reviews before implementation.',
        visibility: 'employee_and_managers',
        status: 'published',
        employee_response: null,
        published_at: now,
        acknowledged_at: null
      }),
      withTimestamps({
        id: ids.feedbackDraft,
        organization_id: ids.organization,
        project_id: ids.project,
        subject_user_id: ids.sana,
        author_user_id: ids.manager,
        feedback_type: 'periodic_review',
        review_period: 'July 2026',
        summary:
          'Draft review covering product discovery, design quality and cross-functional collaboration.',
        strengths: 'Strong discovery facilitation and thoughtful product UX.',
        improvement_areas: 'Document decision rationale closer to the review date.',
        goals: 'Publish a lightweight design-decision log for MVP 4.',
        visibility: 'employee_and_managers',
        status: 'draft',
        employee_response: null,
        published_at: null,
        acknowledged_at: null
      })
    ])
  }

  const [existingContract] = await queryInterface.sequelize.query(
    'SELECT id FROM project_contracts WHERE id = :contractId LIMIT 1',
    {
      replacements: {
        contractId: ids.contract
      }
    }
  )

  if (!existingContract.length) {
    await queryInterface.bulkInsert('project_contracts', [
      withTimestamps({
        id: ids.contract,
        organization_id: ids.organization,
        project_id: ids.project,
        contract_type: 'dedicated_monthly',
        start_date: '2026-03-01',
        end_date: null,
        billing_frequency: 'monthly',
        currency: 'INR',
        agreed_amount: 480000,
        notes: 'Four-person dedicated delivery team billed monthly.'
      })
    ])

    await queryInterface.bulkInsert('billing_records', [
      withTimestamps({
        id: '92000000-0000-4000-8000-000000000001',
        organization_id: ids.organization,
        project_id: ids.project,
        contract_id: ids.contract,
        invoice_reference: 'ATL-2026-05',
        period_start: '2026-05-01',
        period_end: '2026-05-31',
        amount_invoiced: 480000,
        amount_collected: 480000,
        approved_internal_cost: 310000,
        other_expenses: 12000,
        expected_payment_date: '2026-06-10',
        status: 'paid',
        notes: 'Collected in full.'
      }),
      withTimestamps({
        id: '92000000-0000-4000-8000-000000000002',
        organization_id: ids.organization,
        project_id: ids.project,
        contract_id: ids.contract,
        invoice_reference: 'ATL-2026-06',
        period_start: '2026-06-01',
        period_end: '2026-06-30',
        amount_invoiced: 480000,
        amount_collected: 480000,
        approved_internal_cost: 315000,
        other_expenses: 8000,
        expected_payment_date: '2026-07-10',
        status: 'paid',
        notes: null
      }),
      withTimestamps({
        id: '92000000-0000-4000-8000-000000000003',
        organization_id: ids.organization,
        project_id: ids.project,
        contract_id: ids.contract,
        invoice_reference: 'ATL-2026-07',
        period_start: '2026-07-01',
        period_end: '2026-07-31',
        amount_invoiced: 480000,
        amount_collected: 300000,
        approved_internal_cost: 318000,
        other_expenses: 10000,
        expected_payment_date: '2026-08-10',
        status: 'part_paid',
        notes: 'Part payment received; remaining amount expected by due date.'
      })
    ])
  }
}

export const down = async queryInterface => {
  await queryInterface.bulkDelete('billing_records', {
    project_id: ids.project
  })
  await queryInterface.bulkDelete('project_contracts', {
    id: ids.contract
  })
  await queryInterface.bulkDelete('project_feedback', {
    id: [ids.feedbackPublished, ids.feedbackDraft]
  })
}
