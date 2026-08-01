export const up = async (queryInterface, Sequelize) => {
  await queryInterface.createTable('user_invitations', {
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
    role_id: {
      allowNull: false,
      type: Sequelize.UUID,
      references: {
        model: 'roles',
        key: 'id'
      },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE'
    },
    manager_user_id: {
      allowNull: true,
      type: Sequelize.UUID,
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    },
    invited_by_user_id: {
      allowNull: true,
      type: Sequelize.UUID,
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    },
    accepted_user_id: {
      allowNull: true,
      type: Sequelize.UUID,
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    },
    email: {
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
    employment_start_date: {
      allowNull: true,
      type: Sequelize.DATEONLY
    },
    token_hash: {
      allowNull: false,
      type: Sequelize.STRING(64),
      unique: true
    },
    status: {
      allowNull: false,
      type: Sequelize.STRING(24),
      defaultValue: 'pending'
    },
    expires_at: {
      allowNull: false,
      type: Sequelize.DATE
    },
    accepted_at: {
      allowNull: true,
      type: Sequelize.DATE
    },
    revoked_at: {
      allowNull: true,
      type: Sequelize.DATE
    },
    last_sent_at: {
      allowNull: true,
      type: Sequelize.DATE
    },
    delivery_status: {
      allowNull: false,
      type: Sequelize.STRING(24),
      defaultValue: 'pending'
    },
    delivery_error: {
      allowNull: true,
      type: Sequelize.TEXT
    },
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

  await queryInterface.addIndex(
    'user_invitations',
    ['organization_id', 'status', 'expires_at'],
    {
      name: 'user_invitations_organization_status_expiry'
    }
  )
  await queryInterface.addIndex(
    'user_invitations',
    ['organization_id', 'email'],
    {
      name: 'user_invitations_organization_email'
    }
  )
}

export const down = async queryInterface => {
  await queryInterface.dropTable('user_invitations')
}
