const profiles = [
  {
    email: 'riya@projectpulse.local',
    employeeCode: 'PP-001',
    employmentStartDate: '2021-04-12',
    experienceYears: 9.5,
    managerEmail: null,
    skills: ['Delivery leadership', 'Client management', 'Agile delivery'],
    summary:
      'Delivery manager focused on predictable outcomes, healthy teams and clear client communication.'
  },
  {
    email: 'rhea@projectpulse.local',
    employeeCode: 'PP-002',
    employmentStartDate: '2022-01-10',
    experienceYears: 8,
    managerEmail: 'riya@projectpulse.local',
    skills: ['Node.js', 'PostgreSQL', 'System design', 'Team leadership'],
    summary:
      'Backend lead owning platform architecture, engineering quality and technical delivery.'
  },
  {
    email: 'aarav@projectpulse.local',
    employeeCode: 'PP-003',
    employmentStartDate: '2023-02-06',
    experienceYears: 6.5,
    managerEmail: 'riya@projectpulse.local',
    skills: ['React', 'Next.js', 'Design systems', 'Accessibility'],
    summary:
      'Frontend engineer building resilient product experiences and scalable UI foundations.'
  },
  {
    email: 'sana@projectpulse.local',
    employeeCode: 'PP-004',
    employmentStartDate: '2023-06-19',
    experienceYears: 5,
    managerEmail: 'riya@projectpulse.local',
    skills: ['Product design', 'Figma', 'User research', 'Design systems'],
    summary:
      'Product designer translating complex workflows into clear, usable experiences.'
  },
  {
    email: 'manav@projectpulse.local',
    employeeCode: 'PP-005',
    employmentStartDate: '2024-01-08',
    experienceYears: 4.5,
    managerEmail: 'rhea@projectpulse.local',
    skills: ['Test strategy', 'Automation', 'API testing', 'Quality coaching'],
    summary:
      'Quality engineer improving release confidence through risk-based testing and automation.'
  },
  {
    email: 'jia@projectpulse.local',
    employeeCode: 'PP-006',
    employmentStartDate: '2023-09-04',
    experienceYears: 5.5,
    managerEmail: 'rhea@projectpulse.local',
    skills: ['React Native', 'Android', 'iOS', 'Mobile architecture'],
    summary:
      'Mobile engineer delivering reliable cross-platform applications and integrations.'
  },
  {
    email: 'neel@projectpulse.local',
    employeeCode: 'PP-007',
    employmentStartDate: '2022-11-14',
    experienceYears: 7,
    managerEmail: 'rhea@projectpulse.local',
    skills: ['AWS', 'CI/CD', 'Kubernetes', 'Observability'],
    summary:
      'DevOps engineer focused on secure delivery pipelines, reliability and operational visibility.'
  }
]

export const up = async queryInterface => {
  for (const profile of profiles) {
    await queryInterface.sequelize.query(
      `
        UPDATE users
        SET employee_code = :employeeCode,
            employment_start_date = :employmentStartDate,
            total_experience_years = :experienceYears,
            skills = :skills::jsonb,
            profile_summary = :summary,
            manager_user_id = (
              SELECT id FROM users manager
              WHERE manager.email = :managerEmail
              LIMIT 1
            ),
            updated_at = NOW()
        WHERE email = :email
      `,
      {
        replacements: {
          ...profile,
          skills: JSON.stringify(profile.skills)
        }
      }
    )
  }
}

export const down = async queryInterface => {
  await queryInterface.sequelize.query(
    `
      UPDATE users
      SET employee_code = NULL,
          employment_start_date = NULL,
          total_experience_years = NULL,
          skills = '[]'::jsonb,
          profile_summary = NULL,
          manager_user_id = NULL,
          updated_at = NOW()
      WHERE email IN (:emails)
    `,
    {
      replacements: {
        emails: profiles.map(profile => profile.email)
      }
    }
  )
}
