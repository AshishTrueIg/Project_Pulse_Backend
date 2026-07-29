const ratingColumn = Sequelize => ({
  allowNull: true,
  type: Sequelize.SMALLINT
})

export const up = async (queryInterface, Sequelize) => {
  await queryInterface.sequelize.transaction(async transaction => {
    await queryInterface.addColumn(
      'project_feedback',
      'delivery_rating',
      ratingColumn(Sequelize),
      { transaction }
    )
    await queryInterface.addColumn(
      'project_feedback',
      'quality_rating',
      ratingColumn(Sequelize),
      { transaction }
    )
    await queryInterface.addColumn(
      'project_feedback',
      'collaboration_rating',
      ratingColumn(Sequelize),
      { transaction }
    )
    await queryInterface.addColumn(
      'project_feedback',
      'ownership_rating',
      ratingColumn(Sequelize),
      { transaction }
    )
    await queryInterface.addIndex(
      'project_feedback',
      ['organization_id', 'subject_user_id', 'status'],
      {
        name: 'project_feedback_subject_status',
        transaction
      }
    )
    await queryInterface.addIndex(
      'project_feedback',
      ['organization_id', 'published_at'],
      {
        name: 'project_feedback_published_at',
        transaction
      }
    )
  })
}

export const down = async queryInterface => {
  await queryInterface.sequelize.transaction(async transaction => {
    await queryInterface.removeIndex(
      'project_feedback',
      'project_feedback_published_at',
      { transaction }
    )
    await queryInterface.removeIndex(
      'project_feedback',
      'project_feedback_subject_status',
      { transaction }
    )
    await queryInterface.removeColumn(
      'project_feedback',
      'ownership_rating',
      { transaction }
    )
    await queryInterface.removeColumn(
      'project_feedback',
      'collaboration_rating',
      { transaction }
    )
    await queryInterface.removeColumn(
      'project_feedback',
      'quality_rating',
      { transaction }
    )
    await queryInterface.removeColumn(
      'project_feedback',
      'delivery_rating',
      { transaction }
    )
  })
}
