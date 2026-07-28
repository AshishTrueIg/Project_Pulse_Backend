import { ProjectHealthUpdate, sequelize } from '@src/db/models'
import BaseHandler from '@src/libs/baseHandler'

import {
  getProjectForWrite,
  writeAuditLog
} from './projectMutation.helpers'

const optionalText = value => value?.trim() || null

class CreateProjectHealthUpdateService extends BaseHandler {
  async run () {
    const {
      accomplishments,
      blockers,
      health,
      nextSteps,
      projectId,
      summary
    } = this.args
    const auth = this.context.auth

    return sequelize.transaction(async transaction => {
      const project = await getProjectForWrite(projectId, auth, transaction)
      const submittedAt = new Date()
      const healthUpdate = await ProjectHealthUpdate.create(
        {
          organizationId: auth.organizationId,
          projectId,
          submittedByUserId: auth.userId,
          health,
          summary: summary.trim(),
          accomplishments: optionalText(accomplishments),
          nextSteps: optionalText(nextSteps),
          blockers: optionalText(blockers)
        },
        {
          transaction
        }
      )

      await project.update(
        {
          overallHealth: health,
          lastHealthUpdatedAt: submittedAt
        },
        {
          transaction
        }
      )

      await writeAuditLog(
        {
          action: 'project.health_update_submitted',
          afterValue: healthUpdate.toJSON(),
          entityId: healthUpdate.id,
          entityType: 'project_health_update',
          metadata: {
            projectId
          }
        },
        auth,
        transaction
      )

      return {
        id: healthUpdate.id,
        projectId,
        submittedAt: submittedAt.toISOString()
      }
    })
  }
}

export default CreateProjectHealthUpdateService
