const defineProjectAssignment = (sequelize, DataTypes) =>
  sequelize.define(
    'ProjectAssignment',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      projectId: {
        type: DataTypes.UUID,
        allowNull: false
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false
      },
      projectRole: {
        type: DataTypes.STRING(160),
        allowNull: false
      },
      responsibilities: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      workloadSignal: {
        type: DataTypes.STRING(24),
        allowNull: false
      },
      isDedicated: {
        type: DataTypes.BOOLEAN,
        allowNull: false
      },
      joinedAt: {
        type: DataTypes.DATEONLY,
        allowNull: false
      },
      leftAt: {
        type: DataTypes.DATEONLY,
        allowNull: true
      }
    },
    {
      tableName: 'project_assignments'
    }
  )

export default defineProjectAssignment
