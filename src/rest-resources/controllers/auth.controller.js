import {
  getRefreshToken,
  sendLogoutResponse,
  sendSessionResponse
} from '@src/helpers/sessionResponse.helpers'
import { sendResponse } from '@src/helpers/response.helpers'
import GetCurrentUserService from '@src/services/auth/getCurrentUser.service'
import LoginService from '@src/services/auth/login.service'
import LogoutService from '@src/services/auth/logout.service'
import RefreshAccessService from '@src/services/auth/refreshAccess.service'

class AuthController {
  static async login (request, response, next) {
    try {
      const result = await LoginService.execute(request.body, request.context)

      sendSessionResponse({ response }, result)
    } catch (error) {
      next(error)
    }
  }

  static async refresh (request, response, next) {
    try {
      const result = await RefreshAccessService.execute(
        {
          refreshToken: getRefreshToken(request)
        },
        request.context
      )

      sendSessionResponse({ response }, result)
    } catch (error) {
      next(error)
    }
  }

  static async logout (request, response, next) {
    try {
      await LogoutService.execute(
        {
          refreshToken: getRefreshToken(request)
        },
        request.context
      )

      sendLogoutResponse({ response })
    } catch (error) {
      next(error)
    }
  }

  static async me (request, response, next) {
    try {
      const result = await GetCurrentUserService.execute({}, request.context)

      sendResponse({ response }, result)
    } catch (error) {
      next(error)
    }
  }
}

export default AuthController
