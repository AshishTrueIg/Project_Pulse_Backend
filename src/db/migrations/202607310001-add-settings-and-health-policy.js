const DEFAULT_HEALTH_POLICY = {
  version: 1,
  weights: {
    managerAssessment: 40,
    milestoneDelivery: 25,
    riskExposure: 20,
    reportingFreshness: 15
  },
  thresholds: {
    green: 75,
    amber: 50
  }
}

export const up = async (queryInterface, Sequelize) => {
  await queryInterface.sequelize.transaction(async transaction => {
    await queryInterface.addColumn(
      'organizations',
      'health_policy',
      {
        allowNull: false,
        type: Sequelize.JSONB,
        defaultValue: DEFAULT_HEALTH_POLICY
      },
      { transaction }
    )
    await queryInterface.addColumn(
      'projects',
      'manager_health_assessment',
      {
        allowNull: false,
        type: Sequelize.STRING(24),
        defaultValue: 'not_assessed'
      },
      { transaction }
    )
    await queryInterface.addColumn(
      'projects',
      'health_score',
      {
        allowNull: false,
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      { transaction }
    )
    await queryInterface.addColumn(
      'projects',
      'health_breakdown',
      {
        allowNull: true,
        type: Sequelize.JSONB
      },
      { transaction }
    )

    await queryInterface.sequelize.query(
      `
        UPDATE projects
        SET manager_health_assessment = overall_health,
            health_score = CASE overall_health
              WHEN 'green' THEN 84
              WHEN 'amber' THEN 62
              WHEN 'red' THEN 34
              ELSE 0
            END
      `,
      { transaction }
    )
    await queryInterface.sequelize.query(
      `
        UPDATE roles
        SET permissions = permissions ||
          '["settings:read", "settings:write", "audit:read"]'::jsonb
        WHERE name = 'manager'
          AND NOT permissions ? 'settings:write'
      `,
      { transaction }
    )
  })
}

export const down = async queryInterface => {
  await queryInterface.sequelize.transaction(async transaction => {
    await queryInterface.sequelize.query(
      `
        UPDATE roles
        SET permissions = permissions
          - 'settings:read'
          - 'settings:write'
          - 'audit:read'
        WHERE name = 'manager'
      `,
      { transaction }
    )
    await queryInterface.removeColumn(
      'projects',
      'health_breakdown',
      { transaction }
    )
    await queryInterface.removeColumn(
      'projects',
      'health_score',
      { transaction }
    )
    await queryInterface.removeColumn(
      'projects',
      'manager_health_assessment',
      { transaction }
    )
    await queryInterface.removeColumn(
      'organizations',
      'health_policy',
      { transaction }
    )
  })
}
