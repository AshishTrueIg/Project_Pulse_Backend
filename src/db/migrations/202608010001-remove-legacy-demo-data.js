const DEMO_ORGANIZATION_ID = '10000000-0000-4000-8000-000000000001'

const DEMO_PROJECT_IDS = [
  '50000000-0000-4000-8000-000000000001',
  '50000000-0000-4000-8000-000000000002',
  '50000000-0000-4000-8000-000000000003',
  '50000000-0000-4000-8000-000000000004'
]

const DEMO_CLIENT_IDS = [
  '40000000-0000-4000-8000-000000000001',
  '40000000-0000-4000-8000-000000000002',
  '40000000-0000-4000-8000-000000000003',
  '40000000-0000-4000-8000-000000000004'
]

const DEMO_USER_IDS = [
  '30000000-0000-4000-8000-000000000001',
  '30000000-0000-4000-8000-000000000002',
  '30000000-0000-4000-8000-000000000003',
  '30000000-0000-4000-8000-000000000004',
  '30000000-0000-4000-8000-000000000005',
  '30000000-0000-4000-8000-000000000006',
  '30000000-0000-4000-8000-000000000007'
]

export const up = async queryInterface => {
  await queryInterface.sequelize.transaction(async transaction => {
    await queryInterface.sequelize.query(
      `
        WITH demo_entity_ids AS (
          SELECT id FROM projects WHERE id IN (:projectIds)
          UNION SELECT id FROM project_assignments WHERE project_id IN (:projectIds)
          UNION SELECT id FROM milestones WHERE project_id IN (:projectIds)
          UNION SELECT id FROM risks WHERE project_id IN (:projectIds)
          UNION SELECT id FROM project_feedback WHERE project_id IN (:projectIds)
          UNION SELECT id FROM project_contracts WHERE project_id IN (:projectIds)
          UNION SELECT id FROM billing_records WHERE project_id IN (:projectIds)
          UNION SELECT id FROM project_health_updates WHERE project_id IN (:projectIds)
        )
        DELETE FROM audit_logs
        WHERE entity_id IN (SELECT id FROM demo_entity_ids)
           OR entity_id IN (:userIds)
      `,
      {
        replacements: {
          projectIds: DEMO_PROJECT_IDS,
          userIds: DEMO_USER_IDS
        },
        transaction
      }
    )

    await queryInterface.sequelize.query(
      'DELETE FROM projects WHERE id IN (:projectIds)',
      {
        replacements: {
          projectIds: DEMO_PROJECT_IDS
        },
        transaction
      }
    )
    await queryInterface.sequelize.query(
      'DELETE FROM clients WHERE id IN (:clientIds)',
      {
        replacements: {
          clientIds: DEMO_CLIENT_IDS
        },
        transaction
      }
    )
    await queryInterface.sequelize.query(
      'DELETE FROM users WHERE id IN (:userIds)',
      {
        replacements: {
          userIds: DEMO_USER_IDS
        },
        transaction
      }
    )
    await queryInterface.sequelize.query(
      `
        UPDATE organizations
        SET name = 'My Company',
            slug = 'my-company',
            updated_at = NOW()
        WHERE id = :organizationId
          AND slug = 'project-pulse-demo'
      `,
      {
        replacements: {
          organizationId: DEMO_ORGANIZATION_ID
        },
        transaction
      }
    )
  })
}

export const down = async () => {
  // Legacy demo records are intentionally not recreated on rollback.
}
