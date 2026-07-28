const defineProjectContract = (sequelize, DataTypes) =>
  sequelize.define(
    'ProjectContract',
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
      contractType: {
        type: DataTypes.STRING(48),
        allowNull: false
      },
      startDate: {
        type: DataTypes.DATEONLY,
        allowNull: false
      },
      endDate: {
        type: DataTypes.DATEONLY,
        allowNull: true
      },
      billingFrequency: {
        type: DataTypes.STRING(32),
        allowNull: false
      },
      currency: {
        type: DataTypes.STRING(3),
        allowNull: false
      },
      agreedAmount: {
        type: DataTypes.DECIMAL(14, 2),
        allowNull: false
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true
      }
    },
    {
      tableName: 'project_contracts'
    }
  )

export default defineProjectContract
