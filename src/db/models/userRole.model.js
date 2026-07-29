const defineUserRole = (sequelize, DataTypes) =>
  sequelize.define(
    'UserRole',
    {
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true
      },
      roleId: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true
      },
      assignedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      }
    },
    {
      tableName: 'user_roles',
      timestamps: false
    }
  )

export default defineUserRole
