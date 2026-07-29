const defineProjectFeedback = (sequelize, DataTypes) =>
  sequelize.define(
    'ProjectFeedback',
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
      subjectUserId: {
        type: DataTypes.UUID,
        allowNull: false
      },
      authorUserId: {
        type: DataTypes.UUID,
        allowNull: false
      },
      feedbackType: {
        type: DataTypes.STRING(48),
        allowNull: false
      },
      reviewPeriod: {
        type: DataTypes.STRING(120),
        allowNull: false
      },
      summary: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      strengths: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      improvementAreas: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      goals: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      deliveryRating: {
        type: DataTypes.SMALLINT,
        allowNull: true
      },
      qualityRating: {
        type: DataTypes.SMALLINT,
        allowNull: true
      },
      collaborationRating: {
        type: DataTypes.SMALLINT,
        allowNull: true
      },
      ownershipRating: {
        type: DataTypes.SMALLINT,
        allowNull: true
      },
      visibility: {
        type: DataTypes.STRING(32),
        allowNull: false
      },
      status: {
        type: DataTypes.STRING(24),
        allowNull: false
      },
      employeeResponse: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      publishedAt: {
        type: DataTypes.DATE,
        allowNull: true
      },
      acknowledgedAt: {
        type: DataTypes.DATE,
        allowNull: true
      }
    },
    {
      tableName: 'project_feedback'
    }
  )

export default defineProjectFeedback
