import { StatusCodes } from 'http-status-codes'
import { Op } from 'sequelize'

import { Project } from '@src/db/models'
import AppError from '@src/errors/app.error'

import { getScopedProjectWhere } from './project.helpers'

const getProjectForRead = async (projectId, auth, transaction) => {
  const scope = await getScopedProjectWhere(auth, transaction)
  const project = await Project.findOne({
    where: {
      [Op.and]: [
        scope,
        {
          id: projectId
        }
      ]
    },
    transaction
  })

  if (!project) {
    throw new AppError(
      'Project was not found',
      StatusCodes.NOT_FOUND,
      null,
      {
        code: 'PROJECT_NOT_FOUND'
      }
    )
  }

  return project
}

export { getProjectForRead }
