const defineProject = (sequelize, DataTypes) =>
  sequelize.define(
    'Project',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      organizationId: {
        type: DataTypes.UUID,
        allowNull: false
      },
      clientId: {
        type: DataTypes.UUID,
        allowNull: false
      },
      managerUserId: {
        type: DataTypes.UUID,
        allowNull: false
      },
      name: {
        type: DataTypes.STRING(180),
        allowNull: false
      },
      code: {
        type: DataTypes.STRING(40),
        allowNull: false
      },
      stage: {
        type: DataTypes.STRING(64),
        allowNull: false
      },
      overallHealth: {
        type: DataTypes.STRING(24),
        allowNull: false
      },
      managerHealthAssessment: {
        type: DataTypes.STRING(24),
        allowNull: false,
        defaultValue: 'not_assessed'
      },
      healthScore: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      healthBreakdown: {
        type: DataTypes.JSONB,
        allowNull: true
      },
      startDate: {
        type: DataTypes.DATEONLY,
        allowNull: false
      },
      targetEndDate: {
        type: DataTypes.DATEONLY,
        allowNull: true
      },
      lastHealthUpdatedAt: {
        type: DataTypes.DATE,
        allowNull: true
      },
      status: {
        type: DataTypes.STRING(32),
        allowNull: false
      }
    },
    {
      tableName: 'projects'
    }
  )

export default defineProject
