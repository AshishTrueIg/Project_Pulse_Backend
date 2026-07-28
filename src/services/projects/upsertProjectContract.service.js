import { StatusCodes } from 'http-status-codes'

import { ProjectContract, sequelize } from '@src/db/models'
import AppError from '@src/errors/app.error'
import BaseHandler from '@src/libs/baseHandler'

import {
  getProjectForWrite,
  writeAuditLog
} from './projectMutation.helpers'

class UpsertProjectContractService extends BaseHandler {
  async run () {
    const { projectId, ...values } = this.args
    const auth = this.context.auth

    return sequelize.transaction(async transaction => {
      if (values.endDate && values.endDate < values.startDate) {
        throw new AppError(
          'Contract end date cannot be earlier than the start date',
          StatusCodes.UNPROCESSABLE_ENTITY,
          null,
          {
            code: 'INVALID_CONTRACT_TIMELINE'
          }
        )
      }

      await getProjectForWrite(projectId, auth, transaction)
      const existing = await ProjectContract.findOne({
        where: {
          organizationId: auth.organizationId,
          projectId
        },
        transaction
      })
      const beforeValue = existing?.toJSON() || null
      let contract

      if (existing) {
        contract = await existing.update(
          {
            ...values,
            currency: values.currency.toUpperCase(),
            endDate: values.endDate || null,
            notes: values.notes || null
          },
          {
            transaction
          }
        )
      } else {
        contract = await ProjectContract.create(
          {
            organizationId: auth.organizationId,
            projectId,
            ...values,
            currency: values.currency.toUpperCase(),
            endDate: values.endDate || null,
            notes: values.notes || null
          },
          {
            transaction
          }
        )
      }

      await writeAuditLog(
        {
          action: existing ? 'project_contract.updated' : 'project_contract.created',
          afterValue: contract.toJSON(),
          beforeValue,
          entityId: contract.id,
          entityType: 'project_contract',
          metadata: {
            projectId
          }
        },
        auth,
        transaction
      )

      return {
        id: contract.id
      }
    })
  }
}

export default UpsertProjectContractService
