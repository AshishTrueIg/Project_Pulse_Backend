const defineProjectHealthUpdate = (sequelize, DataTypes) =>
  sequelize.define(
    'ProjectHealthUpdate',
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
      projectId: {
        type: DataTypes.UUID,
        allowNull: false
      },
      submittedByUserId: {
        type: DataTypes.UUID,
        allowNull: false
      },
      health: {
        type: DataTypes.STRING(24),
        allowNull: false
      },
      summary: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      accomplishments: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      nextSteps: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      blockers: {
        type: DataTypes.TEXT,
        allowNull: true
      }
    },
    {
      tableName: 'project_health_updates'
    }
  )

export default defineProjectHealthUpdate
