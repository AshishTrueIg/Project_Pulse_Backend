const commonColumns = Sequelize => ({
  created_at: {
    allowNull: false,
    type: Sequelize.DATE,
    defaultValue: Sequelize.fn('NOW')
  },
  updated_at: {
    allowNull: false,
    type: Sequelize.DATE,
    defaultValue: Sequelize.fn('NOW')
  }
})

export const up = async (queryInterface, Sequelize) => {
  await queryInterface.createTable('clients', {
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
    name: {
      allowNull: false,
      type: Sequelize.STRING(180)
    },
    primary_contact_name: {
      allowNull: true,
      type: Sequelize.STRING(160)
    },
    primary_contact_email: {
      allowNull: true,
      type: Sequelize.STRING(255)
    },
    status: {
      allowNull: false,
      type: Sequelize.STRING(32),
      defaultValue: 'active'
    },
    ...commonColumns(Sequelize)
  })

  await queryInterface.addIndex('clients', ['organization_id', 'name'], {
    name: 'clients_organization_name_unique',
    unique: true
  })

  await queryInterface.createTable('projects', {
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
    client_id: {
      allowNull: false,
      type: Sequelize.UUID,
      references: {
        model: 'clients',
        key: 'id'
      },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE'
    },
    manager_user_id: {
      allowNull: false,
      type: Sequelize.UUID,
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE'
    },
    name: {
      allowNull: false,
      type: Sequelize.STRING(180)
    },
    code: {
      allowNull: false,
      type: Sequelize.STRING(40)
    },
    stage: {
      allowNull: false,
      type: Sequelize.STRING(64)
    },
    overall_health: {
      allowNull: false,
      type: Sequelize.STRING(24),
      defaultValue: 'not_assessed'
    },
    start_date: {
      allowNull: false,
      type: Sequelize.DATEONLY
    },
    target_end_date: {
      allowNull: true,
      type: Sequelize.DATEONLY
    },
    last_health_updated_at: {
      allowNull: true,
      type: Sequelize.DATE
    },
    status: {
      allowNull: false,
      type: Sequelize.STRING(32),
      defaultValue: 'active'
    },
    ...commonColumns(Sequelize)
  })

  await queryInterface.addIndex('projects', ['organization_id', 'code'], {
    name: 'projects_organization_code_unique',
    unique: true
  })

  await queryInterface.addIndex('projects', ['organization_id', 'status'], {
    name: 'projects_organization_status'
  })

  await queryInterface.createTable('project_assignments', {
    id: {
      allowNull: false,
      primaryKey: true,
      type: Sequelize.UUID
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
    user_id: {
      allowNull: false,
      type: Sequelize.UUID,
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    },
    project_role: {
      allowNull: false,
      type: Sequelize.STRING(160)
    },
    responsibilities: {
      allowNull: true,
      type: Sequelize.TEXT
    },
    workload_signal: {
      allowNull: false,
      type: Sequelize.STRING(24),
      defaultValue: 'normal'
    },
    is_dedicated: {
      allowNull: false,
      type: Sequelize.BOOLEAN,
      defaultValue: true
    },
    joined_at: {
      allowNull: false,
      type: Sequelize.DATEONLY
    },
    left_at: {
      allowNull: true,
      type: Sequelize.DATEONLY
    },
    ...commonColumns(Sequelize)
  })

  await queryInterface.addIndex('project_assignments', ['project_id', 'user_id'], {
    name: 'project_assignments_project_user_unique',
    unique: true
  })

  await queryInterface.createTable('milestones', {
    id: {
      allowNull: false,
      primaryKey: true,
      type: Sequelize.UUID
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
    owner_user_id: {
      allowNull: false,
      type: Sequelize.UUID,
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE'
    },
    accepted_by_user_id: {
      allowNull: true,
      type: Sequelize.UUID,
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    },
    name: {
      allowNull: false,
      type: Sequelize.STRING(180)
    },
    milestone_type: {
      allowNull: false,
      type: Sequelize.STRING(32),
      defaultValue: 'milestone'
    },
    status: {
      allowNull: false,
      type: Sequelize.STRING(40),
      defaultValue: 'planned'
    },
    acceptance_criteria: {
      allowNull: true,
      type: Sequelize.TEXT
    },
    due_date: {
      allowNull: false,
      type: Sequelize.DATEONLY
    },
    accepted_at: {
      allowNull: true,
      type: Sequelize.DATE
    },
    ...commonColumns(Sequelize)
  })

  await queryInterface.addIndex('milestones', ['project_id', 'due_date'], {
    name: 'milestones_project_due_date'
  })

  await queryInterface.createTable('risks', {
    id: {
      allowNull: false,
      primaryKey: true,
      type: Sequelize.UUID
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
    owner_user_id: {
      allowNull: false,
      type: Sequelize.UUID,
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE'
    },
    title: {
      allowNull: false,
      type: Sequelize.STRING(220)
    },
    description: {
      allowNull: true,
      type: Sequelize.TEXT
    },
    severity: {
      allowNull: false,
      type: Sequelize.STRING(24)
    },
    status: {
      allowNull: false,
      type: Sequelize.STRING(32),
      defaultValue: 'open'
    },
    target_date: {
      allowNull: true,
      type: Sequelize.DATEONLY
    },
    ...commonColumns(Sequelize)
  })

  await queryInterface.addIndex('risks', ['project_id', 'status', 'severity'], {
    name: 'risks_project_status_severity'
  })
}

export const down = async queryInterface => {
  await queryInterface.dropTable('risks')
  await queryInterface.dropTable('milestones')
  await queryInterface.dropTable('project_assignments')
  await queryInterface.dropTable('projects')
  await queryInterface.dropTable('clients')
}
