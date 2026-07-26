import { StatusCodes } from 'http-status-codes'
import { Op } from 'sequelize'

import { Project } from '@src/db/models'
import AppError from '@src/errors/app.error'
import BaseHandler from '@src/libs/baseHandler'

import {
  getScopedProjectWhere,
  projectIncludes,
  serializeProjectDetail
} from './project.helpers'

class GetProjectService extends BaseHandler {
  async run () {
    const { projectId } = this.args
    const scope = await getScopedProjectWhere(
      this.context.auth,
      this.dbTransaction
    )
    const project = await Project.findOne({
      where: {
        [Op.and]: [
          scope,
          {
            id: projectId
          }
        ]
      },
      include: projectIncludes,
      transaction: this.dbTransaction
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

    return serializeProjectDetail(project)
  }
}

export default GetProjectService
