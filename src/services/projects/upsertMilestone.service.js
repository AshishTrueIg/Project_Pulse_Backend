import { StatusCodes } from 'http-status-codes'

import { Milestone, sequelize } from '@src/db/models'
import AppError from '@src/errors/app.error'
import BaseHandler from '@src/libs/baseHandler'

import {
  ensureProjectContributor,
  getOrganizationUser,
  getProjectForWrite,
  writeAuditLog
} from './projectMutation.helpers'

const editableFields = [
  'name',
  'ownerUserId',
  'milestoneType',
  'status',
  'acceptanceCriteria',
  'dueDate'
]

class UpsertMilestoneService extends BaseHandler {
  async run () {
    const { milestoneId, projectId, ...values } = this.args
    const auth = this.context.auth

    return sequelize.transaction(async transaction => {
      const project = await getProjectForWrite(projectId, auth, transaction)
      await getOrganizationUser(
        values.ownerUserId,
        auth.organizationId,
        transaction
      )
      await ensureProjectContributor(
        values.ownerUserId,
        project,
        transaction
      )

      let milestone = null
      let beforeValue = null

      if (milestoneId) {
        milestone = await Milestone.findOne({
          where: {
            id: milestoneId,
            projectId
          },
          transaction
        })

        if (!milestone) {
          throw new AppError(
            'Milestone was not found',
            StatusCodes.NOT_FOUND,
            null,
            {
              code: 'MILESTONE_NOT_FOUND'
            }
          )
        }

        beforeValue = milestone.toJSON()
        const update = Object.fromEntries(
          editableFields
            .filter(field => Object.prototype.hasOwnProperty.call(values, field))
            .map(field => [field, values[field] || null])
        )

        if (values.status === 'accepted' && milestone.status !== 'accepted') {
          update.acceptedByUserId = auth.userId
          update.acceptedAt = new Date()
        } else if (
          values.status &&
          values.status !== 'accepted' &&
          milestone.status === 'accepted'
        ) {
          update.acceptedByUserId = null
          update.acceptedAt = null
        }

        await milestone.update(update, {
          transaction
        })
      } else {
        milestone = await Milestone.create(
          {
            projectId,
            name: values.name.trim(),
            ownerUserId: values.ownerUserId,
            milestoneType: values.milestoneType,
            status: values.status,
            acceptanceCriteria: values.acceptanceCriteria || null,
            dueDate: values.dueDate,
            acceptedByUserId: values.status === 'accepted' ? auth.userId : null,
            acceptedAt: values.status === 'accepted' ? new Date() : null
          },
          {
            transaction
          }
        )
      }

      await writeAuditLog(
        {
          action: milestoneId ? 'milestone.updated' : 'milestone.created',
          afterValue: milestone.toJSON(),
          beforeValue,
          entityId: milestone.id,
          entityType: 'milestone',
          metadata: {
            projectId
          }
        },
        auth,
        transaction
      )

      return {
        id: milestone.id
      }
    })
  }
}

export default UpsertMilestoneService
