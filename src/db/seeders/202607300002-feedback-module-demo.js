const ids = {
  organization: '10000000-0000-4000-8000-000000000001',
  users: {
    riya: '30000000-0000-4000-8000-000000000001',
    aarav: '30000000-0000-4000-8000-000000000002',
    rhea: '30000000-0000-4000-8000-000000000003',
    sana: '30000000-0000-4000-8000-000000000004',
    manav: '30000000-0000-4000-8000-000000000005',
    jia: '30000000-0000-4000-8000-000000000006',
    neel: '30000000-0000-4000-8000-000000000007'
  },
  projects: {
    atlas: '50000000-0000-4000-8000-000000000001',
    nexus: '50000000-0000-4000-8000-000000000002',
    coreBank: '50000000-0000-4000-8000-000000000003',
    verde: '50000000-0000-4000-8000-000000000004'
  },
  existingPublished: '90000000-0000-4000-8000-000000000001',
  existingDraft: '90000000-0000-4000-8000-000000000002'
}

const demoFeedbackIds = [
  '90000000-0000-4000-8000-000000000003',
  '90000000-0000-4000-8000-000000000004',
  '90000000-0000-4000-8000-000000000005',
  '90000000-0000-4000-8000-000000000006',
  '90000000-0000-4000-8000-000000000007',
  '90000000-0000-4000-8000-000000000008'
]

const daysAgo = days => {
  const value = new Date()

  value.setUTCDate(value.getUTCDate() - days)

  return value
}

const withTimestamps = (row, days = 0) => ({
  ...row,
  created_at: daysAgo(days),
  updated_at: daysAgo(days)
})

export const up = async queryInterface => {
  const [projects] = await queryInterface.sequelize.query(
    'SELECT id FROM projects WHERE id = :projectId LIMIT 1',
    {
      replacements: {
        projectId: ids.projects.atlas
      }
    }
  )

  if (!projects.length) return

  await queryInterface.bulkUpdate(
    'project_feedback',
    {
      delivery_rating: 5,
      quality_rating: 4,
      collaboration_rating: 5,
      ownership_rating: 5,
      updated_at: new Date()
    },
    {
      id: ids.existingPublished
    }
  )
  await queryInterface.bulkUpdate(
    'project_feedback',
    {
      delivery_rating: 4,
      quality_rating: 5,
      collaboration_rating: 4,
      ownership_rating: 4,
      updated_at: new Date()
    },
    {
      id: ids.existingDraft
    }
  )

  const [existing] = await queryInterface.sequelize.query(
    'SELECT id FROM project_feedback WHERE id = :feedbackId LIMIT 1',
    {
      replacements: {
        feedbackId: demoFeedbackIds[0]
      }
    }
  )

  if (existing.length) return

  await queryInterface.bulkInsert('project_feedback', [
    withTimestamps({
      id: demoFeedbackIds[0],
      organization_id: ids.organization,
      project_id: ids.projects.nexus,
      subject_user_id: ids.users.neel,
      author_user_id: ids.users.rhea,
      feedback_type: 'team_lead',
      review_period: 'July 2026',
      summary:
        'Neel improved deployment confidence and made production signals easier for the whole delivery team to understand.',
      strengths:
        'Introduced clear release checks.\nReduced time to diagnose production alerts.\nProactively shared operational context.',
      improvement_areas:
        'Bring observability requirements into feature planning earlier.',
      goals:
        'Add service-level dashboards for the top three customer journeys before the next release.',
      delivery_rating: 4,
      quality_rating: 5,
      collaboration_rating: 4,
      ownership_rating: 5,
      visibility: 'employee_and_managers',
      status: 'published',
      employee_response: null,
      published_at: daysAgo(3),
      acknowledged_at: null
    }, 3),
    withTimestamps({
      id: demoFeedbackIds[1],
      organization_id: ids.organization,
      project_id: ids.projects.coreBank,
      subject_user_id: ids.users.rhea,
      author_user_id: ids.users.riya,
      feedback_type: 'manager',
      review_period: 'Q2 2026',
      summary:
        'Rhea has led complex banking integrations with calm technical judgment and dependable client communication.',
      strengths:
        'Strong architecture ownership.\nCreates clarity during ambiguous integration work.\nSupports engineers without taking away ownership.',
      improvement_areas:
        'Escalate external dependency risk sooner when compliance timelines are affected.',
      goals:
        'Define an escalation checklist and use it in the next partner dependency review.',
      delivery_rating: 4,
      quality_rating: 5,
      collaboration_rating: 5,
      ownership_rating: 5,
      visibility: 'employee_and_managers',
      status: 'acknowledged',
      employee_response:
        'Acknowledged. I will introduce the checklist in our next dependency review.',
      published_at: daysAgo(18),
      acknowledged_at: daysAgo(16)
    }, 18),
    withTimestamps({
      id: demoFeedbackIds[2],
      organization_id: ids.organization,
      project_id: ids.projects.coreBank,
      subject_user_id: ids.users.jia,
      author_user_id: ids.users.rhea,
      feedback_type: 'periodic_review',
      review_period: 'July 2026',
      summary:
        'Draft review for mobile journey delivery, banking-domain learning and release collaboration.',
      strengths:
        'Rapid domain learning and thoughtful mobile implementation.',
      improvement_areas:
        'Make edge-case decisions visible earlier to QA and backend partners.',
      goals:
        'Add an edge-case walkthrough before the next mobile feature handoff.',
      delivery_rating: 4,
      quality_rating: 4,
      collaboration_rating: 4,
      ownership_rating: 4,
      visibility: 'employee_and_managers',
      status: 'draft',
      employee_response: null,
      published_at: null,
      acknowledged_at: null
    }, 1),
    withTimestamps({
      id: demoFeedbackIds[3],
      organization_id: ids.organization,
      project_id: ids.projects.coreBank,
      subject_user_id: ids.users.manav,
      author_user_id: ids.users.riya,
      feedback_type: 'client',
      review_period: 'June 2026',
      summary:
        'The client highlighted Manav’s rigorous release validation and clear communication of compliance test evidence.',
      strengths:
        'Detailed regression planning.\nClear evidence packs.\nDependable release partnership.',
      improvement_areas:
        'Continue reducing manual repetition in the compliance regression suite.',
      goals:
        'Automate the five highest-frequency compliance checks this quarter.',
      delivery_rating: 4,
      quality_rating: 5,
      collaboration_rating: 5,
      ownership_rating: 4,
      visibility: 'employee_and_managers',
      status: 'acknowledged',
      employee_response:
        'Thank you. The first two automation candidates are already planned.',
      published_at: daysAgo(32),
      acknowledged_at: daysAgo(30)
    }, 32),
    withTimestamps({
      id: demoFeedbackIds[4],
      organization_id: ids.organization,
      project_id: ids.projects.verde,
      subject_user_id: ids.users.sana,
      author_user_id: ids.users.riya,
      feedback_type: 'manager',
      review_period: 'Q2 2026',
      summary:
        'Sana consistently turns operational complexity into workflows that users can understand and adopt.',
      strengths:
        'Excellent discovery facilitation.\nStrong interaction design quality.\nConnects user evidence to delivery decisions.',
      improvement_areas:
        'Private manager note: create more space for junior contributors during early ideation.',
      goals:
        'Facilitate the next discovery workshop with rotating section owners.',
      delivery_rating: 4,
      quality_rating: 5,
      collaboration_rating: 4,
      ownership_rating: 4,
      visibility: 'managers_only',
      status: 'published',
      employee_response: null,
      published_at: daysAgo(12),
      acknowledged_at: null
    }, 12),
    withTimestamps({
      id: demoFeedbackIds[5],
      organization_id: ids.organization,
      project_id: ids.projects.verde,
      subject_user_id: ids.users.neel,
      author_user_id: ids.users.riya,
      feedback_type: 'project_completion',
      review_period: 'Maintenance transition · July 2026',
      summary:
        'Neel completed the maintenance transition with strong documentation and reliable operational ownership.',
      strengths:
        'Structured handover.\nReliable release ownership.\nClear support documentation.',
      improvement_areas:
        'Add cost signals alongside reliability signals in ongoing infrastructure reviews.',
      goals:
        'Publish a monthly reliability and cost snapshot starting next month.',
      delivery_rating: 5,
      quality_rating: 4,
      collaboration_rating: 4,
      ownership_rating: 5,
      visibility: 'employee_and_managers',
      status: 'published',
      employee_response: null,
      published_at: daysAgo(6),
      acknowledged_at: null
    }, 6)
  ])
}

export const down = async queryInterface => {
  await queryInterface.bulkDelete('project_feedback', {
    id: demoFeedbackIds
  })
  await queryInterface.bulkUpdate(
    'project_feedback',
    {
      delivery_rating: null,
      quality_rating: null,
      collaboration_rating: null,
      ownership_rating: null,
      updated_at: new Date()
    },
    {
      id: [ids.existingPublished, ids.existingDraft]
    }
  )
}
