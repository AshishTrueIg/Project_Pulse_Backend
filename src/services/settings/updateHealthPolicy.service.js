import { StatusCodes } from 'http-status-codes'

import { Organization, sequelize } from '@src/db/models'
import AppError from '@src/errors/app.error'
import BaseHandler from '@src/libs/baseHandler'

import {
  normalizeHealthPolicy,
  recalculateOrganizationProjects
} from '../projects/projectHealth.helpers'
import { writeAuditLog } from '../projects/projectMutation.helpers'

class UpdateHealthPolicyService extends BaseHandler {
  async run () {
    const auth = this.context.auth
    const policy = normalizeHealthPolicy({
      version: 1,
      weights: this.args.weights,
      thresholds: this.args.thresholds
    })
    const weightTotal = Object.values(policy.weights).reduce(
      (total, value) => total + Number(value),
      0
    )

    if (weightTotal !== 100) {
      throw new AppError(
        'Health factor weights must add up to 100%',
        StatusCodes.UNPROCESSABLE_ENTITY,
        null,
        {
          code: 'INVALID_HEALTH_WEIGHTS'
        }
      )
    }

    if (policy.thresholds.green <= policy.thresholds.amber) {
      throw new AppError(
        'The healthy threshold must be higher than the attention threshold',
        StatusCodes.UNPROCESSABLE_ENTITY,
        null,
        {
          code: 'INVALID_HEALTH_THRESHOLDS'
        }
      )
    }

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
          healthPolicy: policy
        },
        {
          transaction
        }
      )

      const recalculatedProjects = await recalculateOrganizationProjects(
        auth.organizationId,
        transaction
      )

      await writeAuditLog(
        {
          action: 'organization.health_policy_updated',
          afterValue: organization.toJSON(),
          beforeValue,
          entityId: organization.id,
          entityType: 'organization',
          metadata: {
            recalculatedProjects: recalculatedProjects.length
          }
        },
        auth,
        transaction
      )

      return {
        healthPolicy: policy,
        recalculatedProjects: recalculatedProjects.length
      }
    })
  }
}

export default UpdateHealthPolicyService
