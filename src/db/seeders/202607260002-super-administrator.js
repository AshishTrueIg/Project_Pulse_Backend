import bcrypt from 'bcrypt'

const SUPER_ADMIN_ID = '30000000-0000-4000-8000-000000000008'
const SUPER_ADMIN_EMAIL = 'admin@pp.com'
const SUPER_ADMIN_PASSWORD = 'U$er1234'

export const up = async queryInterface => {
  const [existingUsers] = await queryInterface.sequelize.query(
    'SELECT id FROM users WHERE email = :email LIMIT 1',
    {
      replacements: {
        email: SUPER_ADMIN_EMAIL
      }
    }
  )

  if (existingUsers.length > 0) return

  const [organizations] = await queryInterface.sequelize.query(
    'SELECT id FROM organizations WHERE slug = :slug LIMIT 1',
    {
      replacements: {
        slug: 'my-company'
      }
    }
  )

  if (organizations.length === 0) {
    throw new Error('Run the bootstrap organization seeder before the super administrator seeder')
  }

  const organizationId = organizations[0].id
  const [ownerRoles] = await queryInterface.sequelize.query(
    'SELECT id FROM roles WHERE organization_id = :organizationId AND name = :name LIMIT 1',
    {
      replacements: {
        organizationId,
        name: 'owner'
      }
    }
  )

  if (ownerRoles.length === 0) {
    throw new Error('The owner role must exist before seeding the super administrator')
  }

  const now = new Date()
  const passwordHash = await bcrypt.hash(SUPER_ADMIN_PASSWORD, 12)

  await queryInterface.bulkInsert('users', [
    {
      id: SUPER_ADMIN_ID,
      organization_id: organizationId,
      email: SUPER_ADMIN_EMAIL,
      password_hash: passwordHash,
      full_name: 'Project Pulse Administrator',
      job_title: 'Super Administrator',
      status: 'active',
      last_login_at: null,
      created_at: now,
      updated_at: now
    }
  ])

  await queryInterface.bulkInsert('user_roles', [
    {
      user_id: SUPER_ADMIN_ID,
      role_id: ownerRoles[0].id,
      assigned_at: now
    }
  ])
}

export const down = async queryInterface => {
  await queryInterface.bulkDelete('user_roles', {
    user_id: SUPER_ADMIN_ID
  })
  await queryInterface.bulkDelete('users', {
    id: SUPER_ADMIN_ID
  })
}
