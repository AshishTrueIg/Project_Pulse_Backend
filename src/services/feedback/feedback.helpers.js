import { StatusCodes } from 'http-status-codes'
import { Op } from 'sequelize'

import {
  Project,
  ProjectAssignment,
  User
} from '@src/db/models'
import AppError from '@src/errors/app.error'

import { hasPermission } from '../projects/projectMutation.helpers'

const RATING_FIELDS = [
  'deliveryRating',
  'qualityRating',
  'collaborationRating',
  'ownershipRating'
]

const feedbackInclude = [
  {
    model: Project,
    as: 'project',
    attributes: ['id', 'code', 'name', 'status']
  },
  {
    model: User,
    as: 'subject',
    attributes: ['id', 'fullName', 'email', 'jobTitle', 'employeeCode']
  },
  {
    model: User,
    as: 'author',
    attributes: ['id', 'fullName', 'jobTitle']
  }
]

const getInitials = fullName =>
  fullName
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase()

const calculateOverallRating = feedback => {
  const ratings = RATING_FIELDS
    .map(field => feedback[field])
    .filter(value => value !== null && value !== undefined && value !== '')
    .map(Number)
    .filter(value => Number.isFinite(value))

  if (!ratings.length) return null

  return Number(
    (ratings.reduce((total, value) => total + value, 0) / ratings.length)
      .toFixed(1)
  )
}

const serializeFeedback = feedback => ({
  id: feedback.id,
  projectId: feedback.projectId,
  feedbackType: feedback.feedbackType,
  reviewPeriod: feedback.reviewPeriod,
  summary: feedback.summary,
  strengths: feedback.strengths,
  improvementAreas: feedback.improvementAreas,
  goals: feedback.goals,
  ratings: {
    delivery: feedback.deliveryRating,
    quality: feedback.qualityRating,
    collaboration: feedback.collaborationRating,
    ownership: feedback.ownershipRating,
    overall: calculateOverallRating(feedback)
  },
  visibility: feedback.visibility,
  status: feedback.status,
  employeeResponse: feedback.employeeResponse,
  publishedAt: feedback.publishedAt,
  acknowledgedAt: feedback.acknowledgedAt,
  createdAt: feedback.createdAt,
  updatedAt: feedback.updatedAt,
  project: feedback.project
    ? {
        id: feedback.project.id,
        code: feedback.project.code,
        name: feedback.project.name,
        status: feedback.project.status
      }
    : null,
  subject: {
    ...feedback.subject.toJSON(),
    initials: getInitials(feedback.subject.fullName)
  },
  author: {
    ...feedback.author.toJSON(),
    initials: getInitials(feedback.author.fullName)
  }
})

const requirePublishedRatings = values => {
  const missingRatings = RATING_FIELDS.filter(field => {
    const value = Number(values[field])

    return !Number.isInteger(value) || value < 1 || value > 5
  })

  if (missingRatings.length) {
    throw new AppError(
      'Complete all four ratings before publishing the review',
      StatusCodes.UNPROCESSABLE_ENTITY,
      null,
      {
        code: 'FEEDBACK_RATINGS_REQUIRED',
        fields: missingRatings
      }
    )
  }
}

const getFeedbackScopeWhere = async (auth, transaction) => {
  if (hasPermission(auth, 'feedback:write')) {
    return {
      organizationId: auth.organizationId
    }
  }

  if (hasPermission(auth, 'feedback:write:assigned')) {
    const assignments = await ProjectAssignment.findAll({
      where: {
        userId: auth.userId,
        leftAt: {
          [Op.is]: null
        }
      },
      attributes: ['projectId'],
      raw: true,
      transaction
    })

    return {
      organizationId: auth.organizationId,
      projectId: {
        [Op.in]: assignments.map(assignment => assignment.projectId)
      }
    }
  }

  if (hasPermission(auth, 'feedback:read:own')) {
    return {
      organizationId: auth.organizationId,
      subjectUserId: auth.userId,
      visibility: 'employee_and_managers',
      status: {
        [Op.in]: ['published', 'acknowledged']
      }
    }
  }

  throw new AppError(
    'You do not have permission to view feedback',
    StatusCodes.FORBIDDEN,
    null,
    {
      code: 'FEEDBACK_ACCESS_DENIED'
    }
  )
}

export {
  calculateOverallRating,
  feedbackInclude,
  getFeedbackScopeWhere,
  requirePublishedRatings,
  RATING_FIELDS,
  serializeFeedback
}
