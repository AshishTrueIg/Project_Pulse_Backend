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
  await queryInterface.createTable('organizations', {
    id: {
      allowNull: false,
      primaryKey: true,
      type: Sequelize.UUID
    },
    name: {
      allowNull: false,
      type: Sequelize.STRING(160)
    },
    slug: {
      allowNull: false,
      unique: true,
      type: Sequelize.STRING(100)
    },
    timezone: {
      allowNull: false,
      type: Sequelize.STRING(80),
      defaultValue: 'Asia/Kolkata'
    },
    currency: {
      allowNull: false,
      type: Sequelize.STRING(3),
      defaultValue: 'INR'
    },
    reporting_cadence_days: {
      allowNull: false,
      type: Sequelize.INTEGER,
      defaultValue: 7
    },
    ...commonColumns(Sequelize)
  })

  await queryInterface.createTable('roles', {
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
      type: Sequelize.STRING(80)
    },
    permissions: {
      allowNull: false,
      type: Sequelize.JSONB,
      defaultValue: []
    },
    is_system: {
      allowNull: false,
      type: Sequelize.BOOLEAN,
      defaultValue: true
    },
    ...commonColumns(Sequelize)
  })

  await queryInterface.addIndex('roles', ['organization_id', 'name'], {
    name: 'roles_organization_name_unique',
    unique: true
  })

  await queryInterface.createTable('users', {
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
    email: {
      allowNull: false,
      unique: true,
      type: Sequelize.STRING(255)
    },
    password_hash: {
      allowNull: false,
      type: Sequelize.STRING(255)
    },
    full_name: {
      allowNull: false,
      type: Sequelize.STRING(160)
    },
    job_title: {
      allowNull: true,
      type: Sequelize.STRING(160)
    },
    status: {
      allowNull: false,
      type: Sequelize.STRING(32),
      defaultValue: 'active'
    },
    last_login_at: {
      allowNull: true,
      type: Sequelize.DATE
    },
    ...commonColumns(Sequelize)
  })

  await queryInterface.addIndex('users', ['organization_id', 'status'], {
    name: 'users_organization_status'
  })

  await queryInterface.createTable('user_roles', {
    user_id: {
      allowNull: false,
      primaryKey: true,
      type: Sequelize.UUID,
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    },
    role_id: {
      allowNull: false,
      primaryKey: true,
      type: Sequelize.UUID,
      references: {
        model: 'roles',
        key: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    },
    assigned_at: {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: Sequelize.fn('NOW')
    }
  })

  await queryInterface.createTable('refresh_sessions', {
    id: {
      allowNull: false,
      primaryKey: true,
      type: Sequelize.UUID
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
    token_hash: {
      allowNull: false,
      type: Sequelize.STRING(64)
    },
    user_agent: {
      allowNull: true,
      type: Sequelize.STRING(500)
    },
    ip_address: {
      allowNull: true,
      type: Sequelize.STRING(64)
    },
    expires_at: {
      allowNull: false,
      type: Sequelize.DATE
    },
    revoked_at: {
      allowNull: true,
      type: Sequelize.DATE
    },
    ...commonColumns(Sequelize)
  })

  await queryInterface.addIndex('refresh_sessions', ['user_id', 'expires_at'], {
    name: 'refresh_sessions_user_expiry'
  })

  await queryInterface.createTable('audit_logs', {
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
    actor_user_id: {
      allowNull: true,
      type: Sequelize.UUID,
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    },
    action: {
      allowNull: false,
      type: Sequelize.STRING(120)
    },
    entity_type: {
      allowNull: false,
      type: Sequelize.STRING(100)
    },
    entity_id: {
      allowNull: true,
      type: Sequelize.UUID
    },
    before_value: {
      allowNull: true,
      type: Sequelize.JSONB
    },
    after_value: {
      allowNull: true,
      type: Sequelize.JSONB
    },
    metadata: {
      allowNull: true,
      type: Sequelize.JSONB
    },
    created_at: {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: Sequelize.fn('NOW')
    }
  })

  await queryInterface.addIndex('audit_logs', ['organization_id', 'created_at'], {
    name: 'audit_logs_organization_created_at'
  })
}

export const down = async queryInterface => {
  await queryInterface.dropTable('audit_logs')
  await queryInterface.dropTable('refresh_sessions')
  await queryInterface.dropTable('user_roles')
  await queryInterface.dropTable('users')
  await queryInterface.dropTable('roles')
  await queryInterface.dropTable('organizations')
}
