const defineClient = (sequelize, DataTypes) =>
  sequelize.define(
    'Client',
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
        type: DataTypes.STRING(180),
        allowNull: false
      },
      primaryContactName: {
        type: DataTypes.STRING(160),
        allowNull: true
      },
      primaryContactEmail: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      status: {
        type: DataTypes.STRING(32),
        allowNull: false
      }
    },
    {
      tableName: 'clients'
    }
  )

export default defineClient
