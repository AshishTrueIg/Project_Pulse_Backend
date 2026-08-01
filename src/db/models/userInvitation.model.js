const defineUserInvitation = (sequelize, DataTypes) =>
  sequelize.define(
    'UserInvitation',
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
      roleId: {
        type: DataTypes.UUID,
        allowNull: false
      },
      managerUserId: {
        type: DataTypes.UUID,
        allowNull: true
      },
      invitedByUserId: {
        type: DataTypes.UUID,
        allowNull: true
      },
      acceptedUserId: {
        type: DataTypes.UUID,
        allowNull: true
      },
      email: {
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
      employmentStartDate: {
        type: DataTypes.DATEONLY,
        allowNull: true
      },
      tokenHash: {
        type: DataTypes.STRING(64),
        allowNull: false,
        unique: true
      },
      status: {
        type: DataTypes.STRING(24),
        allowNull: false,
        defaultValue: 'pending'
      },
      expiresAt: {
        type: DataTypes.DATE,
        allowNull: false
      },
      acceptedAt: {
        type: DataTypes.DATE,
        allowNull: true
      },
      revokedAt: {
        type: DataTypes.DATE,
        allowNull: true
      },
      lastSentAt: {
        type: DataTypes.DATE,
        allowNull: true
      },
      deliveryStatus: {
        type: DataTypes.STRING(24),
        allowNull: false,
        defaultValue: 'pending'
      },
      deliveryError: {
        type: DataTypes.TEXT,
        allowNull: true
      }
    },
    {
      tableName: 'user_invitations'
    }
  )

export default defineUserInvitation
