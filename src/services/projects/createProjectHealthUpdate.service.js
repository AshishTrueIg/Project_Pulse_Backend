import { ProjectHealthUpdate, sequelize } from '@src/db/models'
import BaseHandler from '@src/libs/baseHandler'

import {
  getProjectForWrite,
  writeAuditLog
} from './projectMutation.helpers'
import { recalculateProjectHealth } from './projectHealth.helpers'

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
          managerHealthAssessment: health,
          lastHealthUpdatedAt: submittedAt
        },
        {
          transaction
        }
      )

      const calculatedHealth = await recalculateProjectHealth(
        projectId,
        auth.organizationId,
        transaction
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
        calculatedHealth: calculatedHealth?.status || 'not_assessed',
        healthScore: calculatedHealth?.score || 0,
        submittedAt: submittedAt.toISOString()
      }
    })
  }
}

export default CreateProjectHealthUpdateService
