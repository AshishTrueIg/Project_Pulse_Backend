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
  await queryInterface.createTable('project_feedback', {
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
    subject_user_id: {
      allowNull: false,
      type: Sequelize.UUID,
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE'
    },
    author_user_id: {
      allowNull: false,
      type: Sequelize.UUID,
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE'
    },
    feedback_type: {
      allowNull: false,
      type: Sequelize.STRING(48)
    },
    review_period: {
      allowNull: false,
      type: Sequelize.STRING(120)
    },
    summary: {
      allowNull: false,
      type: Sequelize.TEXT
    },
    strengths: {
      allowNull: true,
      type: Sequelize.TEXT
    },
    improvement_areas: {
      allowNull: true,
      type: Sequelize.TEXT
    },
    goals: {
      allowNull: true,
      type: Sequelize.TEXT
    },
    visibility: {
      allowNull: false,
      type: Sequelize.STRING(32),
      defaultValue: 'employee_and_managers'
    },
    status: {
      allowNull: false,
      type: Sequelize.STRING(24),
      defaultValue: 'draft'
    },
    employee_response: {
      allowNull: true,
      type: Sequelize.TEXT
    },
    published_at: {
      allowNull: true,
      type: Sequelize.DATE
    },
    acknowledged_at: {
      allowNull: true,
      type: Sequelize.DATE
    },
    ...commonColumns(Sequelize)
  })

  await queryInterface.addIndex(
    'project_feedback',
    ['organization_id', 'project_id', 'status'],
    {
      name: 'project_feedback_scope_status'
    }
  )

  await queryInterface.createTable('project_contracts', {
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
    contract_type: {
      allowNull: false,
      type: Sequelize.STRING(48)
    },
    start_date: {
      allowNull: false,
      type: Sequelize.DATEONLY
    },
    end_date: {
      allowNull: true,
      type: Sequelize.DATEONLY
    },
    billing_frequency: {
      allowNull: false,
      type: Sequelize.STRING(32)
    },
    currency: {
      allowNull: false,
      type: Sequelize.STRING(3)
    },
    agreed_amount: {
      allowNull: false,
      type: Sequelize.DECIMAL(14, 2)
    },
    notes: {
      allowNull: true,
      type: Sequelize.TEXT
    },
    ...commonColumns(Sequelize)
  })

  await queryInterface.addIndex('project_contracts', ['project_id'], {
    name: 'project_contracts_project_unique',
    unique: true
  })

  await queryInterface.addIndex(
    'project_contracts',
    ['organization_id', 'project_id'],
    {
      name: 'project_contracts_scope'
    }
  )

  await queryInterface.createTable('billing_records', {
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
    contract_id: {
      allowNull: true,
      type: Sequelize.UUID,
      references: {
        model: 'project_contracts',
        key: 'id'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    },
    invoice_reference: {
      allowNull: false,
      type: Sequelize.STRING(120)
    },
    period_start: {
      allowNull: false,
      type: Sequelize.DATEONLY
    },
    period_end: {
      allowNull: false,
      type: Sequelize.DATEONLY
    },
    amount_invoiced: {
      allowNull: false,
      type: Sequelize.DECIMAL(14, 2),
      defaultValue: 0
    },
    amount_collected: {
      allowNull: false,
      type: Sequelize.DECIMAL(14, 2),
      defaultValue: 0
    },
    approved_internal_cost: {
      allowNull: false,
      type: Sequelize.DECIMAL(14, 2),
      defaultValue: 0
    },
    other_expenses: {
      allowNull: false,
      type: Sequelize.DECIMAL(14, 2),
      defaultValue: 0
    },
    expected_payment_date: {
      allowNull: true,
      type: Sequelize.DATEONLY
    },
    status: {
      allowNull: false,
      type: Sequelize.STRING(24),
      defaultValue: 'pending'
    },
    notes: {
      allowNull: true,
      type: Sequelize.TEXT
    },
    ...commonColumns(Sequelize)
  })

  await queryInterface.addIndex(
    'billing_records',
    ['organization_id', 'project_id', 'period_start'],
    {
      name: 'billing_records_scope_period'
    }
  )

  const [managerRoles] = await queryInterface.sequelize.query(
    'SELECT id, permissions FROM roles WHERE name = :roleName',
    {
      replacements: {
        roleName: 'manager'
      }
    }
  )

  await Promise.all(
    managerRoles.map(role => {
      const permissions = Array.isArray(role.permissions)
        ? role.permissions
        : JSON.parse(role.permissions || '[]')
      const nextPermissions = [...new Set([...permissions, 'financials:write'])]

      return queryInterface.bulkUpdate(
        'roles',
        {
          permissions: JSON.stringify(nextPermissions),
          updated_at: new Date()
        },
        {
          id: role.id
        }
      )
    })
  )
}

export const down = async queryInterface => {
  const [managerRoles] = await queryInterface.sequelize.query(
    'SELECT id, permissions FROM roles WHERE name = :roleName',
    {
      replacements: {
        roleName: 'manager'
      }
    }
  )

  await Promise.all(
    managerRoles.map(role => {
      const permissions = Array.isArray(role.permissions)
        ? role.permissions
        : JSON.parse(role.permissions || '[]')

      return queryInterface.bulkUpdate(
        'roles',
        {
          permissions: JSON.stringify(
            permissions.filter(permission => permission !== 'financials:write')
          ),
          updated_at: new Date()
        },
        {
          id: role.id
        }
      )
    })
  )

  await queryInterface.dropTable('billing_records')
  await queryInterface.dropTable('project_contracts')
  await queryInterface.dropTable('project_feedback')
}
