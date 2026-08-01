import { StatusCodes } from 'http-status-codes'

import { Organization, sequelize } from '@src/db/models'
import AppError from '@src/errors/app.error'
import BaseHandler from '@src/libs/baseHandler'

import { writeAuditLog } from '../projects/projectMutation.helpers'

class UpdateCompanySettingsService extends BaseHandler {
  async run () {
    const auth = this.context.auth
    const changes = this.args

    return sequelize.transaction(async transaction => {
      const organization = await Organization.findByPk(
        auth.organizationId,
        {
          transaction
        }
      )

      if (!organization) {
        throw new AppError(
          'Organization was not found',
          StatusCodes.NOT_FOUND,
          null,
          {
            code: 'ORGANIZATION_NOT_FOUND'
          }
        )
      }

      const beforeValue = organization.toJSON()

      await organization.update(
        {
          name: changes.name.trim(),
          timezone: changes.timezone.trim(),
          currency: changes.currency.trim().toUpperCase(),
          reportingCadenceDays: Number(changes.reportingCadenceDays)
        },
        {
          transaction
        }
      )

      await writeAuditLog(
        {
          action: 'organization.settings_updated',
          afterValue: organization.toJSON(),
          beforeValue,
          entityId: organization.id,
          entityType: 'organization'
        },
        auth,
        transaction
      )

      return {
        organization: {
          id: organization.id,
          name: organization.name,
          slug: organization.slug,
          timezone: organization.timezone,
          currency: organization.currency,
          reportingCadenceDays: organization.reportingCadenceDays
        }
      }
    })
  }
}

export default UpdateCompanySettingsService
