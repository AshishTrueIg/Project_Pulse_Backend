export const up = async (queryInterface, Sequelize) => {
  await queryInterface.createTable('project_health_updates', {
    id: {
      allowNull: false,
      primaryKey: true,
      type: Sequelize.UUID
    },
    organization_id: {
      allowNull: false,
      type: Sequelize.UUID,
      references: {
        model: 'organizations',
        key: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    },
    project_id: {
      allowNull: false,
      type: Sequelize.UUID,
      references: {
        model: 'projects',
        key: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    },
    submitted_by_user_id: {
      allowNull: false,
      type: Sequelize.UUID,
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE'
    },
    health: {
      allowNull: false,
      type: Sequelize.STRING(24)
    },
    summary: {
      allowNull: false,
      type: Sequelize.TEXT
    },
    accomplishments: {
      allowNull: true,
      type: Sequelize.TEXT
    },
    next_steps: {
      allowNull: true,
      type: Sequelize.TEXT
    },
    blockers: {
      allowNull: true,
      type: Sequelize.TEXT
    },
    created_at: {
      allowNull: false,
      defaultValue: Sequelize.fn('NOW'),
      type: Sequelize.DATE
    },
    updated_at: {
      allowNull: false,
      defaultValue: Sequelize.fn('NOW'),
      type: Sequelize.DATE
    }
  })

  await queryInterface.addIndex(
    'project_health_updates',
    ['organization_id', 'project_id', 'created_at'],
    {
      name: 'project_health_updates_scope_created'
    }
  )
}

export const down = async queryInterface => {
  await queryInterface.dropTable('project_health_updates')
}
