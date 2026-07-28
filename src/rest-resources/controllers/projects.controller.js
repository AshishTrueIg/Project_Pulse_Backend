import { sendResponse } from '@src/helpers/response.helpers'
import CreateProjectService from '@src/services/projects/createProject.service'
import GetProjectService from '@src/services/projects/getProject.service'
import GetProjectOptionsService from '@src/services/projects/getProjectOptions.service'
import ListProjectsService from '@src/services/projects/listProjects.service'
import UpdateProjectService from '@src/services/projects/updateProject.service'
import { StatusCodes } from 'http-status-codes'

class ProjectsController {
  static async create (request, response, next) {
    try {
      const result = await CreateProjectService.execute(
        request.body,
        request.context
      )

      sendResponse({ response }, result, {
        message: 'Project created',
        statusCode: StatusCodes.CREATED
      })
    } catch (error) {
      next(error)
    }
  }

  static async list (request, response, next) {
    try {
      const result = await ListProjectsService.execute(
        request.query,
        request.context
      )

      sendResponse({ response }, result)
    } catch (error) {
      next(error)
    }
  }

  static async getById (request, response, next) {
    try {
      const result = await GetProjectService.execute(
        {
          projectId: request.params.projectId
        },
        request.context
      )

      sendResponse({ response }, result)
    } catch (error) {
      next(error)
    }
  }

  static async options (request, response, next) {
    try {
      const result = await GetProjectOptionsService.execute(
        {},
        request.context
      )

      sendResponse({ response }, result)
    } catch (error) {
      next(error)
    }
  }

  static async update (request, response, next) {
    try {
      const result = await UpdateProjectService.execute(
        {
          ...request.body,
          projectId: request.params.projectId
        },
        request.context
      )

      sendResponse({ response }, result, {
        message: 'Project updated'
      })
    } catch (error) {
      next(error)
    }
  }
}

export default ProjectsController
