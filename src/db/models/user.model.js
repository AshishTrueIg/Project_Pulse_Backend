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
      employeeCode: {
        type: DataTypes.STRING(40),
        allowNull: true
      },
      employmentStartDate: {
        type: DataTypes.DATEONLY,
        allowNull: true
      },
      totalExperienceYears: {
        type: DataTypes.DECIMAL(4, 1),
        allowNull: true
      },
      skills: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: []
      },
      profileSummary: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      managerUserId: {
        type: DataTypes.UUID,
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
