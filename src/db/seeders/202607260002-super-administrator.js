import bcrypt from 'bcrypt'

const SUPER_ADMIN_ID = '30000000-0000-4000-8000-000000000008'
const LOCAL_ADMIN_EMAIL = 'admin@pp.com'
const LOCAL_ADMIN_PASSWORD = 'U$er1234'
const DEFAULT_ADMIN_NAME = 'Project Pulse Administrator'

const isBootstrapEnabled = () =>
  String(process.env.BOOTSTRAP_ADMIN_ENABLED || 'true').toLowerCase() !== 'false'

const getBootstrapAdministrator = () => {
  if (!isBootstrapEnabled()) return null

  const isProduction = process.env.NODE_ENV === 'production'
  const email = String(
    process.env.BOOTSTRAP_ADMIN_EMAIL || (isProduction ? '' : LOCAL_ADMIN_EMAIL)
  ).trim().toLowerCase()
  const password = String(
    process.env.BOOTSTRAP_ADMIN_PASSWORD || (isProduction ? '' : LOCAL_ADMIN_PASSWORD)
  )
  const fullName = String(
    process.env.BOOTSTRAP_ADMIN_NAME || DEFAULT_ADMIN_NAME
  ).trim()

  if (!email || !password) {
    throw new Error(
      'BOOTSTRAP_ADMIN_EMAIL and BOOTSTRAP_ADMIN_PASSWORD are required when bootstrapping a production database'
    )
  }

  if (password.length < 8) {
    throw new Error('BOOTSTRAP_ADMIN_PASSWORD must contain at least 8 characters')
  }

  return {
    email,
    password,
    fullName: fullName || DEFAULT_ADMIN_NAME
  }
}

export const up = async queryInterface => {
  const administrator = getBootstrapAdministrator()

  if (!administrator) return

  const [existingUsers] = await queryInterface.sequelize.query(
    'SELECT id FROM users WHERE id = :id OR LOWER(email) = :email LIMIT 1',
    {
      replacements: {
        id: SUPER_ADMIN_ID,
        email: administrator.email
      }
    }
  )

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
  const userId = existingUsers[0]?.id || SUPER_ADMIN_ID

  if (existingUsers.length === 0) {
    const passwordHash = await bcrypt.hash(administrator.password, 12)

    await queryInterface.bulkInsert('users', [
      {
        id: userId,
        organization_id: organizationId,
        email: administrator.email,
        password_hash: passwordHash,
        full_name: administrator.fullName,
        job_title: 'Super Administrator',
        status: 'active',
        last_login_at: null,
        created_at: now,
        updated_at: now
      }
    ])
  }

  const [existingAssignments] = await queryInterface.sequelize.query(
    'SELECT user_id FROM user_roles WHERE user_id = :userId AND role_id = :roleId LIMIT 1',
    {
      replacements: {
        userId,
        roleId: ownerRoles[0].id
      }
    }
  )

  if (existingAssignments.length > 0) return

  await queryInterface.bulkInsert('user_roles', [
    {
      user_id: userId,
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
