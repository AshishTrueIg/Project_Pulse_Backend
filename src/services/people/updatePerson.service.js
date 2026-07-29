import { StatusCodes } from 'http-status-codes'
import { Op } from 'sequelize'

import {
  AuditLog,
  Role,
  User,
  sequelize
} from '@src/db/models'
import AppError from '@src/errors/app.error'
import BaseHandler from '@src/libs/baseHandler'

const optionalText = value => value?.trim() || null

class UpdatePersonService extends BaseHandler {
  async run () {
    const {
      email,
      employeeCode,
      employmentStartDate,
      fullName,
      jobTitle,
      managerUserId,
      personId,
      profileSummary,
      roleId,
      skills,
      status,
      totalExperienceYears
    } = this.args
    const auth = this.context.auth

    return sequelize.transaction(async transaction => {
      const person = await User.findOne({
        where: {
          id: personId,
          organizationId: auth.organizationId
        },
        include: [
          {
            model: Role,
            as: 'roles',
            attributes: ['id', 'name'],
            through: {
              attributes: []
            }
          }
        ],
        transaction
      })

      if (!person) {
        throw new AppError(
          'Person was not found',
          StatusCodes.NOT_FOUND,
          null,
          {
            code: 'PERSON_NOT_FOUND'
          }
        )
      }

      if (email) {
        const duplicateEmail = await User.findOne({
          where: {
            email: email.trim().toLowerCase(),
            id: {
              [Op.ne]: personId
            }
          },
          transaction
        })

        if (duplicateEmail) {
          throw new AppError(
            'A user with this email already exists',
            StatusCodes.CONFLICT,
            null,
            {
              code: 'PERSON_EMAIL_EXISTS'
            }
          )
        }
      }

      if (employeeCode) {
        const duplicateCode = await User.findOne({
          where: {
            employeeCode: employeeCode.trim().toUpperCase(),
            id: {
              [Op.ne]: personId
            },
            organizationId: auth.organizationId
          },
          transaction
        })

        if (duplicateCode) {
          throw new AppError(
            'This employee code is already in use',
            StatusCodes.CONFLICT,
            null,
            {
              code: 'PERSON_CODE_EXISTS'
            }
          )
        }
      }

      if (managerUserId) {
        if (managerUserId === personId) {
          throw new AppError(
            'A person cannot be their own reporting manager',
            StatusCodes.UNPROCESSABLE_ENTITY,
            null,
            {
              code: 'PERSON_SELF_MANAGER'
            }
          )
        }

        const manager = await User.findOne({
          where: {
            id: managerUserId,
            organizationId: auth.organizationId,
            status: 'active'
          },
          transaction
        })

        if (!manager) {
          throw new AppError(
            'Select an active reporting manager',
            StatusCodes.UNPROCESSABLE_ENTITY,
            null,
            {
              code: 'INVALID_PERSON_MANAGER'
            }
          )
        }
      }

      let role = null

      if (roleId) {
        role = await Role.findOne({
          where: {
            id: roleId,
            organizationId: auth.organizationId
          },
          transaction
        })

        if (!role) {
          throw new AppError(
            'Select a role from your organization',
            StatusCodes.UNPROCESSABLE_ENTITY,
            null,
            {
              code: 'INVALID_PERSON_ROLE'
            }
          )
        }
      }

      const beforeValue = person.toJSON()
      const changes = {
        ...(email !== undefined
          ? { email: email.trim().toLowerCase() }
          : {}),
        ...(employeeCode !== undefined
          ? { employeeCode: optionalText(employeeCode)?.toUpperCase() || null }
          : {}),
        ...(employmentStartDate !== undefined
          ? { employmentStartDate: employmentStartDate || null }
          : {}),
        ...(fullName !== undefined ? { fullName: fullName.trim() } : {}),
        ...(jobTitle !== undefined ? { jobTitle: optionalText(jobTitle) } : {}),
        ...(managerUserId !== undefined
          ? { managerUserId: managerUserId || null }
          : {}),
        ...(profileSummary !== undefined
          ? { profileSummary: optionalText(profileSummary) }
          : {}),
        ...(skills !== undefined
          ? {
              skills: [...new Set(
                skills
                  .map(skill => skill.trim())
                  .filter(Boolean)
              )]
            }
          : {}),
        ...(status !== undefined ? { status } : {}),
        ...(totalExperienceYears !== undefined
          ? {
              totalExperienceYears:
                totalExperienceYears === null ||
                totalExperienceYears === ''
                  ? null
                  : Number(totalExperienceYears)
            }
          : {})
      }

      await person.update(changes, {
        transaction
      })

      if (role) {
        await person.setRoles([role], {
          transaction
        })
      }

      await AuditLog.create(
        {
          organizationId: auth.organizationId,
          actorUserId: auth.userId,
          action: 'person.updated',
          entityType: 'user',
          entityId: person.id,
          beforeValue,
          afterValue: {
            ...person.toJSON(),
            roleId: role?.id || person.roles[0]?.id || null
          }
        },
        {
          transaction
        }
      )

      return {
        id: person.id
      }
    })
  }
}

export default UpdatePersonService
