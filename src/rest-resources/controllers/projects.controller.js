import { sendResponse } from '@src/helpers/response.helpers'
import GetProjectService from '@src/services/projects/getProject.service'
import ListProjectsService from '@src/services/projects/listProjects.service'

class ProjectsController {
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
}

export default ProjectsController
