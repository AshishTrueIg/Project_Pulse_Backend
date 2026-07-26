const defineAuditLog = (sequelize, DataTypes) =>
  sequelize.define(
    'AuditLog',
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
      actorUserId: {
        type: DataTypes.UUID,
        allowNull: true
      },
      action: {
        type: DataTypes.STRING(120),
        allowNull: false
      },
      entityType: {
        type: DataTypes.STRING(100),
        allowNull: false
      },
      entityId: {
        type: DataTypes.UUID,
        allowNull: true
      },
      beforeValue: {
        type: DataTypes.JSONB,
        allowNull: true
      },
      afterValue: {
        type: DataTypes.JSONB,
        allowNull: true
      },
      metadata: {
        type: DataTypes.JSONB,
        allowNull: true
      }
    },
    {
      tableName: 'audit_logs',
      updatedAt: false
    }
  )

export default defineAuditLog
