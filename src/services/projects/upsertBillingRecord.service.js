import { StatusCodes } from 'http-status-codes'
import { Op } from 'sequelize'

import {
  BillingRecord,
  ProjectContract,
  sequelize
} from '@src/db/models'
import AppError from '@src/errors/app.error'
import BaseHandler from '@src/libs/baseHandler'

import { getBillingStatus } from './projectFinancial.helpers'
import {
  getProjectForWrite,
  writeAuditLog
} from './projectMutation.helpers'

class UpsertBillingRecordService extends BaseHandler {
  async run () {
    const { billingRecordId, projectId, ...values } = this.args
    const auth = this.context.auth

    return sequelize.transaction(async transaction => {
      if (values.periodEnd < values.periodStart) {
        throw new AppError(
          'Billing period end cannot be earlier than its start',
          StatusCodes.UNPROCESSABLE_ENTITY,
          null,
          {
            code: 'INVALID_BILLING_PERIOD'
          }
        )
      }

      if (Number(values.amountCollected) > Number(values.amountInvoiced)) {
        throw new AppError(
          'Collected amount cannot exceed the invoiced amount',
          StatusCodes.UNPROCESSABLE_ENTITY,
          null,
          {
            code: 'INVALID_COLLECTION_AMOUNT'
          }
        )
      }

      await getProjectForWrite(projectId, auth, transaction)
      const contract = await ProjectContract.findOne({
        where: {
          organizationId: auth.organizationId,
          projectId
        },
        transaction
      })

      if (!contract) {
        throw new AppError(
          'Add the project contract before recording billing',
          StatusCodes.CONFLICT,
          null,
          {
            code: 'PROJECT_CONTRACT_REQUIRED'
          }
        )
      }

      const duplicate = await BillingRecord.findOne({
        where: {
          organizationId: auth.organizationId,
          projectId,
          invoiceReference: values.invoiceReference.trim(),
          ...(billingRecordId
            ? {
                id: {
                  [Op.ne]: billingRecordId
                }
              }
            : {})
        },
        transaction
      })

      if (duplicate) {
        throw new AppError(
          'This invoice reference already exists for the project',
          StatusCodes.CONFLICT,
          null,
          {
            code: 'BILLING_REFERENCE_EXISTS'
          }
        )
      }

      let record
      let beforeValue = null
      const recordValues = {
        ...values,
        invoiceReference: values.invoiceReference.trim(),
        contractId: contract.id,
        expectedPaymentDate: values.expectedPaymentDate || null,
        notes: values.notes || null
      }

      recordValues.status = getBillingStatus(recordValues)

      if (billingRecordId) {
        record = await BillingRecord.findOne({
          where: {
            id: billingRecordId,
            organizationId: auth.organizationId,
            projectId
          },
          transaction
        })

        if (!record) {
          throw new AppError(
            'Billing record was not found',
            StatusCodes.NOT_FOUND,
            null,
            {
              code: 'BILLING_RECORD_NOT_FOUND'
            }
          )
        }

        beforeValue = record.toJSON()
        await record.update(recordValues, {
          transaction
        })
      } else {
        record = await BillingRecord.create(
          {
            organizationId: auth.organizationId,
            projectId,
            ...recordValues
          },
          {
            transaction
          }
        )
      }

      await writeAuditLog(
        {
          action: billingRecordId
            ? 'billing_record.updated'
            : 'billing_record.created',
          afterValue: record.toJSON(),
          beforeValue,
          entityId: record.id,
          entityType: 'billing_record',
          metadata: {
            projectId
          }
        },
        auth,
        transaction
      )

      return {
        id: record.id
      }
    })
  }
}

export default UpsertBillingRecordService
