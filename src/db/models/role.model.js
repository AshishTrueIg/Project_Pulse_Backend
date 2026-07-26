const defineRole = (sequelize, DataTypes) =>
  sequelize.define(
    'Role',
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
      name: {
        type: DataTypes.STRING(80),
        allowNull: false
      },
      permissions: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: []
      },
      isSystem: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
      }
    },
    {
      tableName: 'roles'
    }
  )

export default defineRole
