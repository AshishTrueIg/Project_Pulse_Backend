const defineMilestone = (sequelize, DataTypes) =>
  sequelize.define(
    'Milestone',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      projectId: {
        type: DataTypes.UUID,
        allowNull: false
      },
      ownerUserId: {
        type: DataTypes.UUID,
        allowNull: false
      },
      acceptedByUserId: {
        type: DataTypes.UUID,
        allowNull: true
      },
      name: {
        type: DataTypes.STRING(180),
        allowNull: false
      },
      milestoneType: {
        type: DataTypes.STRING(32),
        allowNull: false
      },
      status: {
        type: DataTypes.STRING(40),
        allowNull: false
      },
      acceptanceCriteria: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      dueDate: {
        type: DataTypes.DATEONLY,
        allowNull: false
      },
      acceptedAt: {
        type: DataTypes.DATE,
        allowNull: true
      }
    },
    {
      tableName: 'milestones'
    }
  )

export default defineMilestone
