const defineRisk = (sequelize, DataTypes) =>
  sequelize.define(
    'Risk',
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
      ownerUserId: {
        type: DataTypes.UUID,
        allowNull: false
      },
      title: {
        type: DataTypes.STRING(220),
        allowNull: false
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      severity: {
        type: DataTypes.STRING(24),
        allowNull: false
      },
      status: {
        type: DataTypes.STRING(32),
        allowNull: false
      },
      targetDate: {
        type: DataTypes.DATEONLY,
        allowNull: true
      }
    },
    {
      tableName: 'risks'
    }
  )

export default defineRisk
