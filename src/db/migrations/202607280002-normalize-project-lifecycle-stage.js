export const up = async queryInterface => {
  await queryInterface.bulkUpdate(
    'projects',
    {
      stage: 'maintenance_retainer',
      updated_at: new Date()
    },
    {
      stage: 'maintenance'
    }
  )
}

export const down = async queryInterface => {
  await queryInterface.bulkUpdate(
    'projects',
    {
      stage: 'maintenance',
      updated_at: new Date()
    },
    {
      stage: 'maintenance_retainer'
    }
  )
}
