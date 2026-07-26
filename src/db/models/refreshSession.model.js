const defineRefreshSession = (sequelize, DataTypes) =>
  sequelize.define(
    'RefreshSession',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false
      },
      tokenHash: {
        type: DataTypes.STRING(64),
        allowNull: false
      },
      userAgent: {
        type: DataTypes.STRING(500),
        allowNull: true
      },
      ipAddress: {
        type: DataTypes.STRING(64),
        allowNull: true
      },
      expiresAt: {
        type: DataTypes.DATE,
        allowNull: false
      },
      revokedAt: {
        type: DataTypes.DATE,
        allowNull: true
      }
    },
    {
      tableName: 'refresh_sessions'
    }
  )

export default defineRefreshSession
