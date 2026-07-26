import bcrypt from 'bcrypt'

const ids = {
  organization: '10000000-0000-4000-8000-000000000001',
  roles: {
    owner: '20000000-0000-4000-8000-000000000001',
    manager: '20000000-0000-4000-8000-000000000002',
    teamLead: '20000000-0000-4000-8000-000000000003',
    employee: '20000000-0000-4000-8000-000000000004'
  },
  users: {
    riya: '30000000-0000-4000-8000-000000000001',
    aarav: '30000000-0000-4000-8000-000000000002',
    rhea: '30000000-0000-4000-8000-000000000003',
    sana: '30000000-0000-4000-8000-000000000004',
    manav: '30000000-0000-4000-8000-000000000005',
    jia: '30000000-0000-4000-8000-000000000006',
    neel: '30000000-0000-4000-8000-000000000007'
  },
  clients: {
    northstar: '40000000-0000-4000-8000-000000000001',
    horizon: '40000000-0000-4000-8000-000000000002',
    axis: '40000000-0000-4000-8000-000000000003',
    verde: '40000000-0000-4000-8000-000000000004'
  },
  projects: {
    atlas: '50000000-0000-4000-8000-000000000001',
    nexus: '50000000-0000-4000-8000-000000000002',
    coreBank: '50000000-0000-4000-8000-000000000003',
    verde: '50000000-0000-4000-8000-000000000004'
  }
}

const now = new Date()
const daysFromNow = days => new Date(now.getTime() + days * 24 * 60 * 60 * 1000)
const dateOnly = value => value.toISOString().slice(0, 10)

const withTimestamps = row => ({
  ...row,
  created_at: now,
  updated_at: now
})

export const up = async queryInterface => {
  const [organizations] = await queryInterface.sequelize.query(
    'SELECT id FROM organizations WHERE slug = :slug LIMIT 1',
    {
      replacements: {
        slug: 'project-pulse-demo'
      }
    }
  )

  if (organizations.length > 0) return

  const passwordHash = await bcrypt.hash('ChangeMe123!', 12)

  await queryInterface.bulkInsert('organizations', [
    withTimestamps({
      id: ids.organization,
      name: 'Project Pulse Demo Company',
      slug: 'project-pulse-demo',
      timezone: 'Asia/Kolkata',
      currency: 'INR',
      reporting_cadence_days: 7
    })
  ])

  await queryInterface.bulkInsert('roles', [
    withTimestamps({
      id: ids.roles.owner,
      organization_id: ids.organization,
      name: 'owner',
      permissions: JSON.stringify(['*']),
      is_system: true
    }),
    withTimestamps({
      id: ids.roles.manager,
      organization_id: ids.organization,
      name: 'manager',
      permissions: JSON.stringify([
        'dashboard:read',
        'projects:read',
        'projects:write',
        'people:read',
        'feedback:write',
        'financials:read'
      ]),
      is_system: true
    }),
    withTimestamps({
      id: ids.roles.teamLead,
      organization_id: ids.organization,
      name: 'team_lead',
      permissions: JSON.stringify([
        'dashboard:read:assigned',
        'projects:read:assigned',
        'projects:update:assigned',
        'feedback:write:assigned'
      ]),
      is_system: true
    }),
    withTimestamps({
      id: ids.roles.employee,
      organization_id: ids.organization,
      name: 'employee',
      permissions: JSON.stringify([
        'dashboard:read:own',
        'projects:read:assigned',
        'feedback:read:own'
      ]),
      is_system: true
    })
  ])

  const users = [
    [ids.users.riya, 'riya@projectpulse.local', 'Riya Mehta', 'Delivery Manager'],
    [ids.users.aarav, 'aarav@projectpulse.local', 'Aarav Kumar', 'Senior Frontend Engineer'],
    [ids.users.rhea, 'rhea@projectpulse.local', 'Rhea Verma', 'Backend Lead'],
    [ids.users.sana, 'sana@projectpulse.local', 'Sana Mirza', 'Product Designer'],
    [ids.users.manav, 'manav@projectpulse.local', 'Manav Patel', 'QA Engineer'],
    [ids.users.jia, 'jia@projectpulse.local', 'Jia Singh', 'Mobile Engineer'],
    [ids.users.neel, 'neel@projectpulse.local', 'Neel Thomas', 'DevOps Engineer']
  ]

  await queryInterface.bulkInsert(
    'users',
    users.map(([id, email, fullName, jobTitle]) =>
      withTimestamps({
        id,
        organization_id: ids.organization,
        email,
        password_hash: passwordHash,
        full_name: fullName,
        job_title: jobTitle,
        status: 'active',
        last_login_at: null
      })
    )
  )

  await queryInterface.bulkInsert('user_roles', [
    { user_id: ids.users.riya, role_id: ids.roles.manager, assigned_at: now },
    { user_id: ids.users.rhea, role_id: ids.roles.teamLead, assigned_at: now },
    { user_id: ids.users.aarav, role_id: ids.roles.employee, assigned_at: now },
    { user_id: ids.users.sana, role_id: ids.roles.employee, assigned_at: now },
    { user_id: ids.users.manav, role_id: ids.roles.employee, assigned_at: now },
    { user_id: ids.users.jia, role_id: ids.roles.employee, assigned_at: now },
    { user_id: ids.users.neel, role_id: ids.roles.employee, assigned_at: now }
  ])

  await queryInterface.bulkInsert('clients', [
    withTimestamps({
      id: ids.clients.northstar,
      organization_id: ids.organization,
      name: 'Northstar Education',
      primary_contact_name: 'Aditi Rao',
      primary_contact_email: 'aditi@northstar.example',
      status: 'active'
    }),
    withTimestamps({
      id: ids.clients.horizon,
      organization_id: ids.organization,
      name: 'Horizon Retail',
      primary_contact_name: 'Karan Shah',
      primary_contact_email: 'karan@horizon.example',
      status: 'active'
    }),
    withTimestamps({
      id: ids.clients.axis,
      organization_id: ids.organization,
      name: 'Axis Financial',
      primary_contact_name: 'Meera Iyer',
      primary_contact_email: 'meera@axis.example',
      status: 'active'
    }),
    withTimestamps({
      id: ids.clients.verde,
      organization_id: ids.organization,
      name: 'Verde Logistics',
      primary_contact_name: 'Rohan Bose',
      primary_contact_email: 'rohan@verde.example',
      status: 'active'
    })
  ])

  await queryInterface.bulkInsert('projects', [
    withTimestamps({
      id: ids.projects.atlas,
      organization_id: ids.organization,
      client_id: ids.clients.northstar,
      manager_user_id: ids.users.riya,
      name: 'Atlas Learning',
      code: 'ATL',
      stage: 'mvp_review',
      overall_health: 'green',
      start_date: dateOnly(daysFromNow(-120)),
      target_end_date: dateOnly(daysFromNow(45)),
      last_health_updated_at: daysFromNow(-2),
      status: 'active'
    }),
    withTimestamps({
      id: ids.projects.nexus,
      organization_id: ids.organization,
      client_id: ids.clients.horizon,
      manager_user_id: ids.users.riya,
      name: 'Nexus Commerce',
      code: 'NXC',
      stage: 'active_development',
      overall_health: 'amber',
      start_date: dateOnly(daysFromNow(-90)),
      target_end_date: dateOnly(daysFromNow(70)),
      last_health_updated_at: daysFromNow(-9),
      status: 'active'
    }),
    withTimestamps({
      id: ids.projects.coreBank,
      organization_id: ids.organization,
      client_id: ids.clients.axis,
      manager_user_id: ids.users.riya,
      name: 'CoreBank Mobile',
      code: 'CBM',
      stage: 'active_development',
      overall_health: 'red',
      start_date: dateOnly(daysFromNow(-155)),
      target_end_date: dateOnly(daysFromNow(20)),
      last_health_updated_at: daysFromNow(-12),
      status: 'active'
    }),
    withTimestamps({
      id: ids.projects.verde,
      organization_id: ids.organization,
      client_id: ids.clients.verde,
      manager_user_id: ids.users.riya,
      name: 'Verde Operations',
      code: 'VOP',
      stage: 'maintenance',
      overall_health: 'green',
      start_date: dateOnly(daysFromNow(-220)),
      target_end_date: null,
      last_health_updated_at: daysFromNow(-8),
      status: 'active'
    })
  ])

  const assignmentRows = [
    [ids.projects.atlas, ids.users.aarav, 'Senior Frontend Engineer', 'Own the learning experience and frontend architecture'],
    [ids.projects.atlas, ids.users.rhea, 'Backend Lead', 'Own platform APIs and data architecture'],
    [ids.projects.atlas, ids.users.sana, 'Product Designer', 'Own product UX and design quality'],
    [ids.projects.atlas, ids.users.manav, 'QA Engineer', 'Own test planning and release quality'],
    [ids.projects.nexus, ids.users.aarav, 'Frontend Engineer', 'Build the commerce admin experience'],
    [ids.projects.nexus, ids.users.rhea, 'Technical Lead', 'Lead delivery and integrations'],
    [ids.projects.nexus, ids.users.neel, 'DevOps Engineer', 'Own cloud delivery and observability'],
    [ids.projects.coreBank, ids.users.jia, 'Mobile Engineer', 'Build customer mobile journeys'],
    [ids.projects.coreBank, ids.users.rhea, 'Backend Lead', 'Own banking integrations'],
    [ids.projects.coreBank, ids.users.manav, 'QA Engineer', 'Own compliance regression testing'],
    [ids.projects.verde, ids.users.sana, 'Product Designer', 'Improve operations workflows'],
    [ids.projects.verde, ids.users.neel, 'DevOps Engineer', 'Maintain reliability and releases']
  ]

  await queryInterface.bulkInsert(
    'project_assignments',
    assignmentRows.map(([projectId, userId, projectRole, responsibilities], index) =>
      withTimestamps({
        id: `60000000-0000-4000-8000-${String(index + 1).padStart(12, '0')}`,
        project_id: projectId,
        user_id: userId,
        project_role: projectRole,
        responsibilities,
        workload_signal: index === 5 ? 'heavy' : 'normal',
        is_dedicated: true,
        joined_at: dateOnly(daysFromNow(-80)),
        left_at: null
      })
    )
  )

  const milestoneRows = []
  const projectMilestoneState = [
    [ids.projects.atlas, ids.users.rhea, 3],
    [ids.projects.nexus, ids.users.rhea, 2],
    [ids.projects.coreBank, ids.users.jia, 1],
    [ids.projects.verde, ids.users.neel, 3]
  ]

  projectMilestoneState.forEach(([projectId, ownerUserId, completedCount], projectIndex) => {
    for (let index = 0; index < 4; index += 1) {
      const accepted = index < completedCount

      milestoneRows.push(
        withTimestamps({
          id: `70000000-0000-4000-${String(projectIndex + 1).padStart(4, '0')}-${String(index + 1).padStart(12, '0')}`,
          project_id: projectId,
          owner_user_id: ownerUserId,
          accepted_by_user_id: accepted ? ids.users.riya : null,
          name: `MVP ${index + 1}`,
          milestone_type: 'mvp',
          status: accepted ? 'accepted' : index === completedCount ? 'in_progress' : 'planned',
          acceptance_criteria: `Agreed acceptance criteria for MVP ${index + 1}`,
          due_date: dateOnly(daysFromNow((index - completedCount + 1) * 14)),
          accepted_at: accepted ? daysFromNow(-(completedCount - index) * 14) : null
        })
      )
    }
  })

  await queryInterface.bulkInsert('milestones', milestoneRows)

  const riskRows = [
    [ids.projects.atlas, ids.users.riya, 'Client SSO response time', 'medium', 'open', 5],
    [ids.projects.atlas, ids.users.aarav, 'Historical data migration sample', 'low', 'open', 8],
    [ids.projects.nexus, ids.users.rhea, 'Catalog API rate limits', 'high', 'mitigating', 3],
    [ids.projects.nexus, ids.users.neel, 'Production observability gaps', 'medium', 'open', 10],
    [ids.projects.coreBank, ids.users.rhea, 'Compliance test environment unavailable', 'critical', 'open', -2],
    [ids.projects.coreBank, ids.users.jia, 'OTP provider instability', 'high', 'open', 1],
    [ids.projects.verde, ids.users.neel, 'Legacy export format', 'low', 'open', 12]
  ]

  await queryInterface.bulkInsert(
    'risks',
    riskRows.map(([projectId, ownerUserId, title, severity, status, targetDays], index) =>
      withTimestamps({
        id: `80000000-0000-4000-8000-${String(index + 1).padStart(12, '0')}`,
        project_id: projectId,
        owner_user_id: ownerUserId,
        title,
        description: `${title} requires an owned mitigation plan.`,
        severity,
        status,
        target_date: dateOnly(daysFromNow(targetDays))
      })
    )
  )
}

export const down = async (queryInterface, Sequelize) => {
  const projectIds = Object.values(ids.projects)
  const userIds = Object.values(ids.users)

  await queryInterface.bulkDelete('risks', {
    project_id: {
      [Sequelize.Op.in]: projectIds
    }
  })
  await queryInterface.bulkDelete('milestones', {
    project_id: {
      [Sequelize.Op.in]: projectIds
    }
  })
  await queryInterface.bulkDelete('project_assignments', {
    project_id: {
      [Sequelize.Op.in]: projectIds
    }
  })
  await queryInterface.bulkDelete('projects', {
    id: {
      [Sequelize.Op.in]: projectIds
    }
  })
  await queryInterface.bulkDelete('clients', {
    organization_id: ids.organization
  })
  await queryInterface.bulkDelete('user_roles', {
    user_id: {
      [Sequelize.Op.in]: userIds
    }
  })
  await queryInterface.bulkDelete('users', {
    id: {
      [Sequelize.Op.in]: userIds
    }
  })
  await queryInterface.bulkDelete('roles', {
    organization_id: ids.organization
  })
  await queryInterface.bulkDelete('organizations', {
    id: ids.organization
  })
}
