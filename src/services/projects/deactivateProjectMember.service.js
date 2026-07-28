import { StatusCodes } from 'http-status-codes'

import { ProjectAssignment, sequelize } from '@src/db/models'
import AppError from '@src/errors/app.error'
import BaseHandler from '@src/libs/baseHandler'

import {
  getProjectForWrite,
  writeAuditLog
} from './projectMutation.helpers'

const today = () => new Date().toISOString().slice(0, 10)

class DeactivateProjectMemberService extends BaseHandler {
  async run () {
    const { assignmentId, leftAt, projectId } = this.args
    const auth = this.context.auth

    return sequelize.transaction(async transaction => {
      await getProjectForWrite(projectId, auth, transaction)
      const assignment = await ProjectAssignment.findOne({
        where: {
          id: assignmentId,
          projectId
        },
        transaction
      })

      if (!assignment) {
        throw new AppError(
          'Project member was not found',
          StatusCodes.NOT_FOUND,
          null,
          {
            code: 'PROJECT_MEMBER_NOT_FOUND'
          }
        )
      }

      const beforeValue = assignment.toJSON()

      await assignment.update(
        {
          leftAt: leftAt || today()
        },
        {
          transaction
        }
      )

      await writeAuditLog(
        {
          action: 'project_member.deactivated',
          afterValue: assignment.toJSON(),
          beforeValue,
          entityId: assignment.id,
          entityType: 'project_assignment',
          metadata: {
            projectId
          }
        },
        auth,
        transaction
      )

      return {
        id: assignment.id
      }
    })
  }
}

export default DeactivateProjectMemberService
