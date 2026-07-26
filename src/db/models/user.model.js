const defineUser = (sequelize, DataTypes) =>
  sequelize.define(
    'User',
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
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true
      },
      passwordHash: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      fullName: {
        type: DataTypes.STRING(160),
        allowNull: false
      },
      jobTitle: {
        type: DataTypes.STRING(160),
        allowNull: true
      },
      status: {
        type: DataTypes.STRING(32),
        allowNull: false,
        defaultValue: 'active'
      },
      lastLoginAt: {
        type: DataTypes.DATE,
        allowNull: true
      }
    },
    {
      tableName: 'users'
    }
  )

export default defineUser
