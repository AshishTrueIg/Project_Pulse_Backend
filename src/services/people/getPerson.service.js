import { Op } from 'sequelize'

import {
  Project,
  ProjectFeedback,
  User
} from '@src/db/models'
import AppError from '@src/errors/app.error'
import BaseHandler from '@src/libs/baseHandler'
import { calculateOverallRating } from '@src/services/feedback/feedback.helpers'
import { StatusCodes } from 'http-status-codes'

import {
  formatAssignment,
  getPeopleScopeWhere,
  hasPermission,
  personIncludes,
  serializePerson
} from './people.helpers'
import { getScopedProjectWhere } from '../projects/project.helpers'

class GetPersonService extends BaseHandler {
  async run () {
    const { personId } = this.args
    const auth = this.context.auth
    const scope = await getPeopleScopeWhere(auth, this.dbTransaction)
    const person = await User.findOne({
      where: {
        [Op.and]: [
          scope,
          {
            id: personId
          }
        ]
      },
      include: [
        ...personIncludes,
        {
          model: User,
          as: 'directReports',
          attributes: ['id', 'fullName', 'email', 'jobTitle', 'status']
        }
      ],
      transaction: this.dbTransaction
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

    const canManageAllFeedback = hasPermission(
      auth,
      'feedback:write'
    )
    const canReadAllFeedback = hasPermission(auth, 'feedback:read')
    const canManageAssignedFeedback =
      !canManageAllFeedback &&
      hasPermission(auth, 'feedback:write:assigned')
    const canManageFeedback =
      canManageAllFeedback || canManageAssignedFeedback
    const feedbackWhere = {
      organizationId: auth.organizationId,
      subjectUserId: person.id,
      status: {
        [Op.in]: ['published', 'acknowledged']
      }
    }

    if (canManageAssignedFeedback) {
      const projectScope = await getScopedProjectWhere(
        auth,
        this.dbTransaction
      )

      feedbackWhere.projectId = projectScope.id
    } else if (!canManageFeedback && !canReadAllFeedback) {
      feedbackWhere.visibility = 'employee_and_managers'
      feedbackWhere.subjectUserId = auth.userId
    }

    let feedback = []

    if (person.id === auth.userId || canManageFeedback || canReadAllFeedback) {
      feedback = await ProjectFeedback.findAll({
        where: feedbackWhere,
        include: [
          {
            model: Project,
            as: 'project',
            attributes: ['id', 'code', 'name']
          },
          {
            model: User,
            as: 'author',
            attributes: ['id', 'fullName', 'jobTitle']
          }
        ],
        order: [['publishedAt', 'DESC']],
        transaction: this.dbTransaction
      })
    }
    const serialized = serializePerson(person)

    return {
      ...serialized,
      assignments: person.projectAssignments
        .map(formatAssignment)
        .sort((left, right) => {
          if (!left.leftAt && right.leftAt) return -1
          if (left.leftAt && !right.leftAt) return 1

          return right.joinedAt.localeCompare(left.joinedAt)
        }),
      directReports: person.directReports.map(report => ({
        id: report.id,
        fullName: report.fullName,
        email: report.email,
        jobTitle: report.jobTitle,
        status: report.status
      })),
      feedback: feedback.map(item => ({
        id: item.id,
        project: item.project,
        feedbackType: item.feedbackType,
        reviewPeriod: item.reviewPeriod,
        summary: item.summary,
        strengths: item.strengths,
        improvementAreas: item.improvementAreas,
        goals: item.goals,
        ratings: {
          delivery: item.deliveryRating,
          quality: item.qualityRating,
          collaboration: item.collaborationRating,
          ownership: item.ownershipRating,
          overall: calculateOverallRating(item)
        },
        status: item.status,
        visibility: item.visibility,
        publishedAt: item.publishedAt,
        acknowledgedAt: item.acknowledgedAt,
        author: item.author
      }))
    }
  }
}

export default GetPersonService
