import { sendResponse } from '@src/helpers/response.helpers'
import GetPeopleOptionsService from '@src/services/people/getPeopleOptions.service'
import GetPersonService from '@src/services/people/getPerson.service'
import ListPeopleService from '@src/services/people/listPeople.service'
import UpdatePersonService from '@src/services/people/updatePerson.service'

class PeopleController {
  static async list (request, response, next) {
    try {
      const result = await ListPeopleService.execute(
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
      const result = await GetPersonService.execute(
        {
          personId: request.params.personId
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
      const result = await GetPeopleOptionsService.execute(
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
      const result = await UpdatePersonService.execute(
        {
          ...request.body,
          personId: request.params.personId
        },
        request.context
      )

      sendResponse({ response }, result, {
        message: 'Person profile updated'
      })
    } catch (error) {
      next(error)
    }
  }
}

export default PeopleController
