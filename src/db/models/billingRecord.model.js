const defineBillingRecord = (sequelize, DataTypes) =>
  sequelize.define(
    'BillingRecord',
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
      contractId: {
        type: DataTypes.UUID,
        allowNull: true
      },
      invoiceReference: {
        type: DataTypes.STRING(120),
        allowNull: false
      },
      periodStart: {
        type: DataTypes.DATEONLY,
        allowNull: false
      },
      periodEnd: {
        type: DataTypes.DATEONLY,
        allowNull: false
      },
      amountInvoiced: {
        type: DataTypes.DECIMAL(14, 2),
        allowNull: false
      },
      amountCollected: {
        type: DataTypes.DECIMAL(14, 2),
        allowNull: false
      },
      approvedInternalCost: {
        type: DataTypes.DECIMAL(14, 2),
        allowNull: false
      },
      otherExpenses: {
        type: DataTypes.DECIMAL(14, 2),
        allowNull: false
      },
      expectedPaymentDate: {
        type: DataTypes.DATEONLY,
        allowNull: true
      },
      status: {
        type: DataTypes.STRING(24),
        allowNull: false
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true
      }
    },
    {
      tableName: 'billing_records'
    }
  )

export default defineBillingRecord
