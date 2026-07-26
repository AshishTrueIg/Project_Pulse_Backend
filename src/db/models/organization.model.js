const defineOrganization = (sequelize, DataTypes) =>
  sequelize.define(
    'Organization',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      name: {
        type: DataTypes.STRING(160),
        allowNull: false
      },
      slug: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true
      },
      timezone: {
        type: DataTypes.STRING(80),
        allowNull: false
      },
      currency: {
        type: DataTypes.STRING(3),
        allowNull: false
      },
      reportingCadenceDays: {
        type: DataTypes.INTEGER,
        allowNull: false
      }
    },
    {
      tableName: 'organizations'
    }
  )

export default defineOrganization
