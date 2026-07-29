export const up = async (queryInterface, Sequelize) => {
  await queryInterface.addColumn('users', 'employee_code', {
    allowNull: true,
    type: Sequelize.STRING(40)
  })
  await queryInterface.addColumn('users', 'employment_start_date', {
    allowNull: true,
    type: Sequelize.DATEONLY
  })
  await queryInterface.addColumn('users', 'total_experience_years', {
    allowNull: true,
    type: Sequelize.DECIMAL(4, 1)
  })
  await queryInterface.addColumn('users', 'skills', {
    allowNull: false,
    defaultValue: [],
    type: Sequelize.JSONB
  })
  await queryInterface.addColumn('users', 'profile_summary', {
    allowNull: true,
    type: Sequelize.TEXT
  })
  await queryInterface.addColumn('users', 'manager_user_id', {
    allowNull: true,
    type: Sequelize.UUID,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE'
  })

  await queryInterface.addIndex('users', ['organization_id', 'employee_code'], {
    name: 'users_organization_employee_code_unique',
    unique: true,
    where: {
      employee_code: {
        [Sequelize.Op.ne]: null
      }
    }
  })
  await queryInterface.addIndex('users', ['manager_user_id'], {
    name: 'users_manager'
  })

  await queryInterface.sequelize.query(`
    UPDATE roles
    SET permissions = permissions || '["people:write"]'::jsonb
    WHERE name = 'manager'
      AND NOT permissions ? 'people:write'
  `)
  await queryInterface.sequelize.query(`
    UPDATE roles
    SET permissions = permissions || '["people:read:assigned"]'::jsonb
    WHERE name = 'team_lead'
      AND NOT permissions ? 'people:read:assigned'
  `)
  await queryInterface.sequelize.query(`
    UPDATE roles
    SET permissions = permissions || '["people:read:self"]'::jsonb
    WHERE name = 'employee'
      AND NOT permissions ? 'people:read:self'
  `)
}

export const down = async queryInterface => {
  await queryInterface.sequelize.query(`
    UPDATE roles SET permissions = permissions - 'people:write'
    WHERE name = 'manager'
  `)
  await queryInterface.sequelize.query(`
    UPDATE roles SET permissions = permissions - 'people:read:assigned'
    WHERE name = 'team_lead'
  `)
  await queryInterface.sequelize.query(`
    UPDATE roles SET permissions = permissions - 'people:read:self'
    WHERE name = 'employee'
  `)

  await queryInterface.removeIndex(
    'users',
    'users_organization_employee_code_unique'
  )
  await queryInterface.removeIndex('users', 'users_manager')
  await queryInterface.removeColumn('users', 'manager_user_id')
  await queryInterface.removeColumn('users', 'profile_summary')
  await queryInterface.removeColumn('users', 'skills')
  await queryInterface.removeColumn('users', 'total_experience_years')
  await queryInterface.removeColumn('users', 'employment_start_date')
  await queryInterface.removeColumn('users', 'employee_code')
}
