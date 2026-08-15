import bcrypt from 'bcrypt'

const DEMO_ORGANIZATION_SLUG = 'project-pulse-portfolio-demo'
const DEFAULT_DEMO_EMAIL = 'demo@projectpulse.app'
const DEFAULT_DEMO_PASSWORD = 'Demo@1234'
const DAY_IN_MS = 24 * 60 * 60 * 1000

const deterministicId = (prefix, index = 1) =>
  `${prefix}-0000-4000-8000-${String(index).padStart(12, '0')}`

const ids = {
  organization: deterministicId('a1000000'),
  roles: {
    demoViewer: deterministicId('a2000000', 1),
    manager: deterministicId('a2000000', 2),
    teamLead: deterministicId('a2000000', 3),
    employee: deterministicId('a2000000', 4)
  },
  users: {
    demo: deterministicId('a3000000', 1),
    riya: deterministicId('a3000000', 2),
    rhea: deterministicId('a3000000', 3),
    aarav: deterministicId('a3000000', 4),
    sana: deterministicId('a3000000', 5),
    manav: deterministicId('a3000000', 6),
    jia: deterministicId('a3000000', 7),
    neel: deterministicId('a3000000', 8)
  },
  clients: {
    northstar: deterministicId('a4000000', 1),
    horizon: deterministicId('a4000000', 2),
    axis: deterministicId('a4000000', 3),
    verde: deterministicId('a4000000', 4)
  },
  projects: {
    atlas: deterministicId('a5000000', 1),
    nexus: deterministicId('a5000000', 2),
    coreBank: deterministicId('a5000000', 3),
    verde: deterministicId('a5000000', 4)
  }
}

const isDemoModeEnabled = () =>
  String(process.env.DEMO_MODE || '').toLowerCase() === 'true'

const getDemoCredentials = () => ({
  email: process.env.DEMO_ACCOUNT_EMAIL || DEFAULT_DEMO_EMAIL,
  password: process.env.DEMO_ACCOUNT_PASSWORD || DEFAULT_DEMO_PASSWORD
})

const dateOnly = value => value.toISOString().slice(0, 10)
const daysFromNow = (now, days) => new Date(now.getTime() + days * DAY_IN_MS)
const withTimestamps = (row, createdAt) => ({
  ...row,
  created_at: createdAt,
  updated_at: createdAt
})

const monthWindow = (now, offset) => {
  const start = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth() + offset,
    1
  ))
  const end = new Date(Date.UTC(
    start.getUTCFullYear(),
    start.getUTCMonth() + 1,
    0
  ))
  const expectedPayment = new Date(Date.UTC(
    start.getUTCFullYear(),
    start.getUTCMonth() + 1,
    10
  ))

  return {
    end: dateOnly(end),
    expectedPayment: dateOnly(expectedPayment),
    label: `${start.getUTCFullYear()}-${String(start.getUTCMonth() + 1).padStart(2, '0')}`,
    start: dateOnly(start)
  }
}

const healthBreakdown = ({ assessment, calculatedAt, score, signals, status }) =>
  JSON.stringify({
    calculatedAt: calculatedAt.toISOString(),
    factors: {
      managerAssessment: {
        contribution: assessment === 'green' ? 40 : assessment === 'amber' ? 24 : 8,
        score: assessment === 'green' ? 100 : assessment === 'amber' ? 60 : 20,
        weight: 40
      },
      milestoneDelivery: {
        contribution: Math.round(score * 0.25),
        score,
        weight: 25
      },
      reportingFreshness: {
        contribution: score >= 75 ? 15 : score >= 50 ? 9 : 3,
        score: score >= 75 ? 100 : score >= 50 ? 60 : 20,
        weight: 15
      },
      riskExposure: {
        contribution: Math.round(score * 0.2),
        score,
        weight: 20
      }
    },
    managerAssessment: assessment,
    score,
    signals,
    status
  })

const roleRows = now => [
  withTimestamps({
    id: ids.roles.demoViewer,
    organization_id: ids.organization,
    name: 'demo_viewer',
    permissions: JSON.stringify([
      'dashboard:read',
      'projects:read',
      'people:read',
      'feedback:read',
      'financials:read',
      'settings:read',
      'audit:read'
    ]),
    is_system: false
  }, now),
  withTimestamps({
    id: ids.roles.manager,
    organization_id: ids.organization,
    name: 'manager',
    permissions: JSON.stringify([
      'dashboard:read',
      'projects:read',
      'projects:write',
      'people:read',
      'people:write',
      'feedback:write',
      'financials:read',
      'financials:write',
      'settings:read',
      'settings:write',
      'audit:read'
    ]),
    is_system: true
  }, now),
  withTimestamps({
    id: ids.roles.teamLead,
    organization_id: ids.organization,
    name: 'team_lead',
    permissions: JSON.stringify([
      'dashboard:read:assigned',
      'projects:read:assigned',
      'projects:update:assigned',
      'people:read:assigned',
      'feedback:write:assigned'
    ]),
    is_system: true
  }, now),
  withTimestamps({
    id: ids.roles.employee,
    organization_id: ids.organization,
    name: 'employee',
    permissions: JSON.stringify([
      'dashboard:read:own',
      'projects:read:assigned',
      'people:read:self',
      'feedback:read:own'
    ]),
    is_system: true
  }, now)
]

const userDefinitions = credentials => [
  {
    id: ids.users.demo,
    email: credentials.email,
    fullName: 'Jordan Lee',
    jobTitle: 'Portfolio Director',
    employeeCode: 'PP-DEMO',
    employmentStartDate: '2021-04-12',
    experienceYears: 10,
    managerId: null,
    roleId: ids.roles.demoViewer,
    skills: ['Portfolio strategy', 'Delivery governance', 'Client success'],
    summary: 'Demo portfolio leader with read-only access to the complete Project Pulse workspace.'
  },
  {
    id: ids.users.riya,
    email: 'riya@projectpulse.demo',
    fullName: 'Riya Mehta',
    jobTitle: 'Delivery Manager',
    employeeCode: 'PP-001',
    employmentStartDate: '2021-08-09',
    experienceYears: 9.5,
    managerId: ids.users.demo,
    roleId: ids.roles.manager,
    skills: ['Delivery leadership', 'Client management', 'Agile delivery'],
    summary: 'Delivery manager focused on predictable outcomes, healthy teams and clear client communication.'
  },
  {
    id: ids.users.rhea,
    email: 'rhea@projectpulse.demo',
    fullName: 'Rhea Verma',
    jobTitle: 'Backend Lead',
    employeeCode: 'PP-002',
    employmentStartDate: '2022-01-10',
    experienceYears: 8,
    managerId: ids.users.riya,
    roleId: ids.roles.teamLead,
    skills: ['Node.js', 'PostgreSQL', 'System design', 'Team leadership'],
    summary: 'Backend lead owning platform architecture, engineering quality and technical delivery.'
  },
  {
    id: ids.users.aarav,
    email: 'aarav@projectpulse.demo',
    fullName: 'Aarav Kumar',
    jobTitle: 'Senior Frontend Engineer',
    employeeCode: 'PP-003',
    employmentStartDate: '2023-02-06',
    experienceYears: 6.5,
    managerId: ids.users.riya,
    roleId: ids.roles.employee,
    skills: ['React', 'Next.js', 'Design systems', 'Accessibility'],
    summary: 'Frontend engineer building resilient product experiences and scalable UI foundations.'
  },
  {
    id: ids.users.sana,
    email: 'sana@projectpulse.demo',
    fullName: 'Sana Mirza',
    jobTitle: 'Product Designer',
    employeeCode: 'PP-004',
    employmentStartDate: '2023-06-19',
    experienceYears: 5,
    managerId: ids.users.riya,
    roleId: ids.roles.employee,
    skills: ['Product design', 'Figma', 'User research', 'Design systems'],
    summary: 'Product designer translating complex workflows into clear, usable experiences.'
  },
  {
    id: ids.users.manav,
    email: 'manav@projectpulse.demo',
    fullName: 'Manav Patel',
    jobTitle: 'QA Engineer',
    employeeCode: 'PP-005',
    employmentStartDate: '2024-01-08',
    experienceYears: 4.5,
    managerId: ids.users.rhea,
    roleId: ids.roles.employee,
    skills: ['Test strategy', 'Automation', 'API testing', 'Quality coaching'],
    summary: 'Quality engineer improving release confidence through risk-based testing and automation.'
  },
  {
    id: ids.users.jia,
    email: 'jia@projectpulse.demo',
    fullName: 'Jia Singh',
    jobTitle: 'Mobile Engineer',
    employeeCode: 'PP-006',
    employmentStartDate: '2023-09-04',
    experienceYears: 5.5,
    managerId: ids.users.rhea,
    roleId: ids.roles.employee,
    skills: ['React Native', 'Android', 'iOS', 'Mobile architecture'],
    summary: 'Mobile engineer delivering reliable cross-platform applications and integrations.'
  },
  {
    id: ids.users.neel,
    email: 'neel@projectpulse.demo',
    fullName: 'Neel Thomas',
    jobTitle: 'DevOps Engineer',
    employeeCode: 'PP-007',
    employmentStartDate: '2022-11-14',
    experienceYears: 7,
    managerId: ids.users.rhea,
    roleId: ids.roles.employee,
    skills: ['AWS', 'CI/CD', 'Kubernetes', 'Observability'],
    summary: 'DevOps engineer focused on secure delivery pipelines, reliability and operational visibility.'
  }
]

const projectDefinitions = now => [
  {
    id: ids.projects.atlas,
    clientId: ids.clients.northstar,
    name: 'Atlas Learning',
    code: 'ATL',
    stage: 'mvp_review',
    health: 'green',
    assessment: 'green',
    score: 86,
    startDays: -160,
    endDays: 50,
    lastUpdateDays: -2,
    signals: []
  },
  {
    id: ids.projects.nexus,
    clientId: ids.clients.horizon,
    name: 'Nexus Commerce',
    code: 'NXC',
    stage: 'active_development',
    health: 'amber',
    assessment: 'amber',
    score: 61,
    startDays: -110,
    endDays: 70,
    lastUpdateDays: -10,
    signals: ['The latest project update is outside the reporting cadence']
  },
  {
    id: ids.projects.coreBank,
    clientId: ids.clients.axis,
    name: 'CoreBank Mobile',
    code: 'CBM',
    stage: 'active_development',
    health: 'red',
    assessment: 'red',
    score: 38,
    startDays: -190,
    endDays: 25,
    lastUpdateDays: -12,
    signals: [
      'The latest manager assessment is critical',
      'Active high-priority risks are reducing project health'
    ]
  },
  {
    id: ids.projects.verde,
    clientId: ids.clients.verde,
    name: 'Verde Operations',
    code: 'VOP',
    stage: 'maintenance_retainer',
    health: 'green',
    assessment: 'green',
    score: 82,
    startDays: -240,
    endDays: null,
    lastUpdateDays: -4,
    signals: []
  }
].map(project => ({
  ...project,
  lastUpdatedAt: daysFromNow(now, project.lastUpdateDays)
}))

const assignmentDefinitions = [
  [ids.projects.atlas, ids.users.aarav, 'Senior Frontend Engineer', 'Own the learning experience and frontend architecture', 'normal'],
  [ids.projects.atlas, ids.users.rhea, 'Backend Lead', 'Own platform APIs and data architecture', 'normal'],
  [ids.projects.atlas, ids.users.sana, 'Product Designer', 'Own product UX and design quality', 'normal'],
  [ids.projects.atlas, ids.users.manav, 'QA Engineer', 'Own test planning and release quality', 'normal'],
  [ids.projects.nexus, ids.users.aarav, 'Frontend Engineer', 'Build the commerce admin experience', 'heavy'],
  [ids.projects.nexus, ids.users.rhea, 'Technical Lead', 'Lead delivery and integrations', 'heavy'],
  [ids.projects.nexus, ids.users.neel, 'DevOps Engineer', 'Own cloud delivery and observability', 'normal'],
  [ids.projects.coreBank, ids.users.jia, 'Mobile Engineer', 'Build customer mobile journeys', 'normal'],
  [ids.projects.coreBank, ids.users.rhea, 'Backend Lead', 'Own banking integrations', 'heavy'],
  [ids.projects.coreBank, ids.users.manav, 'QA Engineer', 'Own compliance regression testing', 'normal'],
  [ids.projects.verde, ids.users.sana, 'Product Designer', 'Improve operations workflows', 'normal'],
  [ids.projects.verde, ids.users.neel, 'DevOps Engineer', 'Maintain reliability and releases', 'normal']
]

const feedbackDefinitions = (now, reviewPeriod) => [
  [ids.projects.atlas, ids.users.aarav, ids.users.riya, 'manager', 'published', 3, 5, 4, 5, 5, 'A strong month of technical ownership, dependable delivery and clear collaboration across the team.'],
  [ids.projects.atlas, ids.users.sana, ids.users.riya, 'periodic_review', 'draft', 1, 4, 5, 4, 4, 'Draft review covering product discovery, design quality and cross-functional collaboration.'],
  [ids.projects.nexus, ids.users.neel, ids.users.rhea, 'team_lead', 'published', 6, 4, 5, 4, 5, 'Improved deployment confidence and made production signals easier for the delivery team to understand.'],
  [ids.projects.coreBank, ids.users.rhea, ids.users.riya, 'manager', 'acknowledged', 18, 4, 5, 5, 5, 'Led complex banking integrations with calm technical judgment and dependable client communication.'],
  [ids.projects.coreBank, ids.users.jia, ids.users.rhea, 'periodic_review', 'draft', 2, 4, 4, 4, 4, 'Draft review for mobile journey delivery, domain learning and release collaboration.'],
  [ids.projects.coreBank, ids.users.manav, ids.users.riya, 'client', 'acknowledged', 32, 4, 5, 5, 4, 'The client highlighted rigorous release validation and clear compliance evidence.'],
  [ids.projects.verde, ids.users.sana, ids.users.riya, 'manager', 'published', 12, 4, 5, 4, 4, 'Consistently turns operational complexity into workflows users can understand and adopt.'],
  [ids.projects.verde, ids.users.neel, ids.users.riya, 'project_completion', 'published', 8, 5, 4, 4, 5, 'Completed the maintenance transition with strong documentation and reliable ownership.']
].map(([
  projectId,
  subjectUserId,
  authorUserId,
  feedbackType,
  status,
  ageDays,
  deliveryRating,
  qualityRating,
  collaborationRating,
  ownershipRating,
  summary
], index) => {
  const createdAt = daysFromNow(now, -ageDays)
  const published = status !== 'draft'
  const acknowledged = status === 'acknowledged'

  return withTimestamps({
    id: deterministicId('a9000000', index + 1),
    organization_id: ids.organization,
    project_id: projectId,
    subject_user_id: subjectUserId,
    author_user_id: authorUserId,
    feedback_type: feedbackType,
    review_period: reviewPeriod,
    summary,
    strengths: 'Clear ownership, dependable execution and thoughtful cross-functional collaboration.',
    improvement_areas: 'Surface delivery risks earlier and delegate ownership before high-pressure milestones.',
    goals: 'Document the next delivery decision and mentor another contributor through implementation.',
    delivery_rating: deliveryRating,
    quality_rating: qualityRating,
    collaboration_rating: collaborationRating,
    ownership_rating: ownershipRating,
    visibility: 'employee_and_managers',
    status,
    employee_response: acknowledged ? 'Acknowledged. I have added the next action to my delivery plan.' : null,
    published_at: published ? createdAt : null,
    acknowledged_at: acknowledged ? daysFromNow(createdAt, 2) : null
  }, createdAt)
})

const insertDemoWorkspace = async (
  queryInterface,
  credentials,
  passwordHash,
  now,
  transaction
) => {
  const insert = (table, rows) =>
    queryInterface.bulkInsert(table, rows, { transaction })
  const projects = projectDefinitions(now)
  const users = userDefinitions(credentials)

  await insert('organizations', [
    withTimestamps({
      id: ids.organization,
      name: 'Project Pulse Demo Studio',
      slug: DEMO_ORGANIZATION_SLUG,
      timezone: 'Asia/Kolkata',
      currency: 'INR',
      reporting_cadence_days: 7,
      health_policy: JSON.stringify({
        version: 1,
        weights: {
          managerAssessment: 40,
          milestoneDelivery: 25,
          riskExposure: 20,
          reportingFreshness: 15
        },
        thresholds: {
          green: 75,
          amber: 50
        }
      })
    }, now)
  ])
  await insert('roles', roleRows(now))
  await insert(
    'users',
    users.map(user => withTimestamps({
      id: user.id,
      organization_id: ids.organization,
      email: user.email,
      password_hash: passwordHash,
      full_name: user.fullName,
      job_title: user.jobTitle,
      employee_code: user.employeeCode,
      employment_start_date: user.employmentStartDate,
      total_experience_years: user.experienceYears,
      skills: JSON.stringify(user.skills),
      profile_summary: user.summary,
      manager_user_id: user.managerId,
      status: 'active',
      last_login_at: null
    }, now))
  )
  await insert(
    'user_roles',
    users.map(user => ({
      user_id: user.id,
      role_id: user.roleId,
      assigned_at: now
    }))
  )
  await insert('clients', [
    [ids.clients.northstar, 'Northstar Education', 'Aditi Rao', 'aditi@northstar.example'],
    [ids.clients.horizon, 'Horizon Retail', 'Karan Shah', 'karan@horizon.example'],
    [ids.clients.axis, 'Axis Financial', 'Meera Iyer', 'meera@axis.example'],
    [ids.clients.verde, 'Verde Logistics', 'Rohan Bose', 'rohan@verde.example']
  ].map(([id, name, contactName, contactEmail]) => withTimestamps({
    id,
    organization_id: ids.organization,
    name,
    primary_contact_name: contactName,
    primary_contact_email: contactEmail,
    status: 'active'
  }, now)))
  await insert(
    'projects',
    projects.map(project => withTimestamps({
      id: project.id,
      organization_id: ids.organization,
      client_id: project.clientId,
      manager_user_id: ids.users.riya,
      name: project.name,
      code: project.code,
      stage: project.stage,
      overall_health: project.health,
      manager_health_assessment: project.assessment,
      health_score: project.score,
      health_breakdown: healthBreakdown({
        assessment: project.assessment,
        calculatedAt: project.lastUpdatedAt,
        score: project.score,
        signals: project.signals,
        status: project.health
      }),
      start_date: dateOnly(daysFromNow(now, project.startDays)),
      target_end_date: project.endDays === null
        ? null
        : dateOnly(daysFromNow(now, project.endDays)),
      last_health_updated_at: project.lastUpdatedAt,
      status: 'active'
    }, now))
  )
  await insert(
    'project_assignments',
    assignmentDefinitions.map(([
      projectId,
      userId,
      projectRole,
      responsibilities,
      workloadSignal
    ], index) => withTimestamps({
      id: deterministicId('a6000000', index + 1),
      project_id: projectId,
      user_id: userId,
      project_role: projectRole,
      responsibilities,
      workload_signal: workloadSignal,
      is_dedicated: true,
      joined_at: dateOnly(daysFromNow(now, -90)),
      left_at: null
    }, now))
  )

  const milestoneRows = []
  const milestoneState = [
    [ids.projects.atlas, ids.users.rhea, 3],
    [ids.projects.nexus, ids.users.rhea, 2],
    [ids.projects.coreBank, ids.users.jia, 1],
    [ids.projects.verde, ids.users.neel, 3]
  ]

  milestoneState.forEach(([
    projectId,
    ownerUserId,
    acceptedCount
  ], projectIndex) => {
    for (let index = 0; index < 4; index += 1) {
      const accepted = index < acceptedCount
      const dueDays = (index - acceptedCount + 1) * 14

      milestoneRows.push(withTimestamps({
        id: deterministicId('a7000000', projectIndex * 4 + index + 1),
        project_id: projectId,
        owner_user_id: ownerUserId,
        accepted_by_user_id: accepted ? ids.users.riya : null,
        name: `MVP ${index + 1}`,
        milestone_type: 'mvp',
        status: accepted ? 'accepted' : index === acceptedCount ? 'in_progress' : 'planned',
        acceptance_criteria: `Client-approved scope, quality checks and acceptance criteria for MVP ${index + 1}.`,
        due_date: dateOnly(daysFromNow(now, dueDays)),
        accepted_at: accepted ? daysFromNow(now, dueDays - 2) : null
      }, now))
    }
  })
  await insert('milestones', milestoneRows)

  const riskDefinitions = [
    [ids.projects.atlas, ids.users.riya, 'Client SSO response time', 'medium', 'open', 5],
    [ids.projects.atlas, ids.users.aarav, 'Historical migration sample', 'low', 'open', 8],
    [ids.projects.nexus, ids.users.rhea, 'Catalog API rate limits', 'high', 'mitigating', 3],
    [ids.projects.nexus, ids.users.neel, 'Production observability gaps', 'medium', 'open', 10],
    [ids.projects.coreBank, ids.users.rhea, 'Compliance test environment unavailable', 'critical', 'open', -2],
    [ids.projects.coreBank, ids.users.jia, 'OTP provider instability', 'high', 'open', 1],
    [ids.projects.verde, ids.users.neel, 'Legacy export format', 'low', 'mitigating', 12]
  ]

  await insert(
    'risks',
    riskDefinitions.map(([
      projectId,
      ownerUserId,
      title,
      severity,
      status,
      targetDays
    ], index) => withTimestamps({
      id: deterministicId('a8000000', index + 1),
      project_id: projectId,
      owner_user_id: ownerUserId,
      title,
      description: `${title} requires an owned mitigation plan and weekly progress review.`,
      severity,
      status,
      target_date: dateOnly(daysFromNow(now, targetDays))
    }, now))
  )

  const healthUpdateRows = []

  projects.forEach((project, projectIndex) => {
    const summaries = {
      atlas: 'MVP review is on track with client acceptance sessions scheduled.',
      nexus: 'Catalog integration remains at risk while rate-limit mitigation is tested.',
      coreBank: 'Compliance environment access is blocking the planned release validation.',
      verde: 'Maintenance transition is stable with reliability targets being met.'
    }
    const projectKey = Object.entries(ids.projects)
      .find(([, projectId]) => projectId === project.id)[0]

    ;[project.lastUpdateDays - 7, project.lastUpdateDays].forEach((age, updateIndex) => {
      const createdAt = daysFromNow(now, age)

      healthUpdateRows.push(withTimestamps({
        id: deterministicId('ac000000', projectIndex * 2 + updateIndex + 1),
        organization_id: ids.organization,
        project_id: project.id,
        submitted_by_user_id: ids.users.riya,
        health: project.assessment,
        summary: summaries[projectKey],
        accomplishments: 'Completed planned delivery reviews and clarified ownership for the next outcome.',
        next_steps: 'Close the highest-priority action and share evidence in the next client update.',
        blockers: project.signals.length ? project.signals.join('\n') : null
      }, createdAt))
    })
  })
  await insert('project_health_updates', healthUpdateRows)

  const reviewPeriod = new Intl.DateTimeFormat('en', {
    month: 'long',
    timeZone: 'UTC',
    year: 'numeric'
  }).format(daysFromNow(now, -30))

  await insert('project_feedback', feedbackDefinitions(now, reviewPeriod))

  const contractDefinitions = [
    [ids.projects.atlas, 'dedicated_monthly', 480000, 'Four-person dedicated delivery team billed monthly.'],
    [ids.projects.nexus, 'time_and_material', 360000, 'Monthly billing against approved delivery capacity.'],
    [ids.projects.coreBank, 'dedicated_monthly', 420000, 'Dedicated mobile, backend and compliance QA team.'],
    [ids.projects.verde, 'maintenance_retainer', 180000, 'Ongoing reliability and workflow improvement retainer.']
  ]
  const contractIds = contractDefinitions.map((_, index) =>
    deterministicId('aa000000', index + 1)
  )

  await insert(
    'project_contracts',
    contractDefinitions.map(([
      projectId,
      contractType,
      agreedAmount,
      notes
    ], index) => withTimestamps({
      id: contractIds[index],
      organization_id: ids.organization,
      project_id: projectId,
      contract_type: contractType,
      start_date: dateOnly(daysFromNow(now, -180)),
      end_date: null,
      billing_frequency: 'monthly',
      currency: 'INR',
      agreed_amount: agreedAmount,
      notes
    }, now))
  )

  const billingRows = []

  contractDefinitions.forEach(([
    projectId,
    ,
    agreedAmount
  ], projectIndex) => {
    const projectCode = projects.find(project => project.id === projectId).code

    ;[-3, -2, -1].forEach((monthOffset, monthIndex) => {
      const period = monthWindow(now, monthOffset)
      const isLatest = monthIndex === 2
      const isAtRisk = projectId === ids.projects.nexus || projectId === ids.projects.coreBank
      const collected = isLatest && isAtRisk
        ? Math.round(agreedAmount * 0.55)
        : agreedAmount

      billingRows.push(withTimestamps({
        id: deterministicId('ab000000', projectIndex * 3 + monthIndex + 1),
        organization_id: ids.organization,
        project_id: projectId,
        contract_id: contractIds[projectIndex],
        invoice_reference: `${projectCode}-${period.label}`,
        period_start: period.start,
        period_end: period.end,
        amount_invoiced: agreedAmount,
        amount_collected: collected,
        approved_internal_cost: Math.round(agreedAmount * 0.66),
        other_expenses: 6000 + projectIndex * 2500,
        expected_payment_date: period.expectedPayment,
        status: collected === agreedAmount ? 'paid' : 'part_paid',
        notes: collected === agreedAmount
          ? 'Payment collected in full.'
          : 'Balance is under follow-up with the client finance team.'
      }, now))
    })
  })
  await insert('billing_records', billingRows)

  const activityDefinitions = [
    ['project.created', 'project', ids.projects.atlas, ids.users.riya, -25, { name: 'Atlas Learning' }],
    ['project_health_update.created', 'project_health_update', deterministicId('ac000000', 2), ids.users.riya, -2, { title: 'Atlas weekly update' }],
    ['project_feedback.published', 'project_feedback', deterministicId('a9000000', 1), ids.users.riya, -3, { title: 'Aarav monthly review' }],
    ['project_member.assigned', 'project_assignment', deterministicId('a6000000', 7), ids.users.rhea, -9, { name: 'Neel Thomas' }],
    ['project_contract.updated', 'project_contract', contractIds[1], ids.users.riya, -14, { name: 'Nexus Commerce contract' }],
    ['project_risk.created', 'risk', deterministicId('a8000000', 5), ids.users.rhea, -12, { title: 'Compliance test environment unavailable' }],
    ['company.settings.updated', 'organization', ids.organization, ids.users.demo, -20, { name: 'Project Pulse Demo Studio' }],
    ['project_feedback.acknowledged', 'project_feedback', deterministicId('a9000000', 4), ids.users.rhea, -16, { title: 'Rhea quarterly review' }]
  ]

  await insert(
    'audit_logs',
    activityDefinitions.map(([
      action,
      entityType,
      entityId,
      actorUserId,
      ageDays,
      afterValue
    ], index) => ({
      id: deterministicId('ad000000', index + 1),
      organization_id: ids.organization,
      actor_user_id: actorUserId,
      action,
      entity_type: entityType,
      entity_id: entityId,
      before_value: null,
      after_value: JSON.stringify(afterValue),
      metadata: JSON.stringify({ source: 'portfolio_demo' }),
      created_at: daysFromNow(now, ageDays)
    }))
  )
}

export const up = async queryInterface => {
  if (!isDemoModeEnabled()) return

  const credentials = getDemoCredentials()
  const passwordHash = await bcrypt.hash(credentials.password, 12)
  const [existingOrganizations] = await queryInterface.sequelize.query(
    'SELECT id FROM organizations WHERE slug = :slug LIMIT 1',
    {
      replacements: {
        slug: DEMO_ORGANIZATION_SLUG
      }
    }
  )

  if (existingOrganizations.length) {
    await queryInterface.sequelize.query(
      `
        UPDATE users
        SET email = :email,
            password_hash = :passwordHash,
            updated_at = NOW()
        WHERE id = :userId
          AND organization_id = :organizationId
      `,
      {
        replacements: {
          email: credentials.email,
          organizationId: ids.organization,
          passwordHash,
          userId: ids.users.demo
        }
      }
    )

    return
  }

  const [emailCollisions] = await queryInterface.sequelize.query(
    'SELECT id FROM users WHERE email = :email LIMIT 1',
    {
      replacements: {
        email: credentials.email
      }
    }
  )

  if (emailCollisions.length) {
    throw new Error('The configured demo account email is already in use')
  }

  const now = new Date()

  await queryInterface.sequelize.transaction(transaction =>
    insertDemoWorkspace(
      queryInterface,
      credentials,
      passwordHash,
      now,
      transaction
    )
  )
}

export const down = async queryInterface => {
  await queryInterface.sequelize.transaction(async transaction => {
    const replacements = {
      organizationId: ids.organization
    }
    const options = {
      replacements,
      transaction
    }

    await queryInterface.sequelize.query(
      'DELETE FROM audit_logs WHERE organization_id = :organizationId',
      options
    )
    await queryInterface.sequelize.query(
      'DELETE FROM billing_records WHERE organization_id = :organizationId',
      options
    )
    await queryInterface.sequelize.query(
      'DELETE FROM project_contracts WHERE organization_id = :organizationId',
      options
    )
    await queryInterface.sequelize.query(
      'DELETE FROM project_feedback WHERE organization_id = :organizationId',
      options
    )
    await queryInterface.sequelize.query(
      'DELETE FROM project_health_updates WHERE organization_id = :organizationId',
      options
    )
    await queryInterface.sequelize.query(
      'DELETE FROM projects WHERE organization_id = :organizationId',
      options
    )
    await queryInterface.sequelize.query(
      'DELETE FROM clients WHERE organization_id = :organizationId',
      options
    )
    await queryInterface.sequelize.query(
      'DELETE FROM user_roles WHERE user_id IN (SELECT id FROM users WHERE organization_id = :organizationId)',
      options
    )
    await queryInterface.sequelize.query(
      'DELETE FROM users WHERE organization_id = :organizationId',
      options
    )
    await queryInterface.sequelize.query(
      'DELETE FROM roles WHERE organization_id = :organizationId',
      options
    )
    await queryInterface.sequelize.query(
      'DELETE FROM organizations WHERE id = :organizationId',
      options
    )
  })
}
