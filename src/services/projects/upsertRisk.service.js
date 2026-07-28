import { StatusCodes } from 'http-status-codes'

import { Risk, sequelize } from '@src/db/models'
import AppError from '@src/errors/app.error'
import BaseHandler from '@src/libs/baseHandler'

import {
  ensureProjectContributor,
  getOrganizationUser,
  getProjectForWrite,
  writeAuditLog
} from './projectMutation.helpers'

const editableFields = [
  'title',
  'description',
  'ownerUserId',
  'severity',
  'status',
  'targetDate'
]

class UpsertRiskService extends BaseHandler {
  async run () {
    const { projectId, riskId, ...values } = this.args
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

      let risk = null
      let beforeValue = null

      if (riskId) {
        risk = await Risk.findOne({
          where: {
            id: riskId,
            projectId
          },
          transaction
        })

        if (!risk) {
          throw new AppError(
            'Risk was not found',
            StatusCodes.NOT_FOUND,
            null,
            {
              code: 'RISK_NOT_FOUND'
            }
          )
        }

        beforeValue = risk.toJSON()
        const update = Object.fromEntries(
          editableFields
            .filter(field => Object.prototype.hasOwnProperty.call(values, field))
            .map(field => [field, values[field] || null])
        )

        await risk.update(update, {
          transaction
        })
      } else {
        risk = await Risk.create(
          {
            projectId,
            title: values.title.trim(),
            description: values.description || null,
            ownerUserId: values.ownerUserId,
            severity: values.severity,
            status: values.status,
            targetDate: values.targetDate || null
          },
          {
            transaction
          }
        )
      }

      await writeAuditLog(
        {
          action: riskId ? 'risk.updated' : 'risk.created',
          afterValue: risk.toJSON(),
          beforeValue,
          entityId: risk.id,
          entityType: 'risk',
          metadata: {
            projectId
          }
        },
        auth,
        transaction
      )

      return {
        id: risk.id
      }
    })
  }
}

export default UpsertRiskService
