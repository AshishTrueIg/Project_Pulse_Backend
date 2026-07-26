import { StatusCodes } from 'http-status-codes'

import config from '@src/configs/app.config'
import login from '@src/services/auth/login.service'
import logout from '@src/services/auth/logout.service'
import refreshAccess from '@src/services/auth/refreshAccess.service'
import { serializeAuthUser } from '@src/services/auth/authUser.service'

const getRequestContext = request => ({
  ipAddress: request.ip,
  userAgent: request.get('user-agent')
})

const refreshCookieOptions = {
  httpOnly: true,
  maxAge: config.get('jwt.refreshCookieMaxAgeMs'),
  path: '/api/v1/auth',
  sameSite: 'strict',
  secure: config.get('env') === 'production'
}

const setRefreshCookie = (response, refreshToken) => {
  response.cookie(config.get('jwt.refreshCookieName'), refreshToken, refreshCookieOptions)
}

const clearRefreshCookie = response => {
  const { maxAge, ...clearCookieOptions } = refreshCookieOptions

  response.clearCookie(config.get('jwt.refreshCookieName'), clearCookieOptions)
}

const loginController = async (request, response) => {
  const result = await login(request.body, getRequestContext(request))

  setRefreshCookie(response, result.refreshToken)

  response.status(StatusCodes.OK).json({
    data: {
      accessToken: result.accessToken,
      user: result.user
    }
  })
}

const refreshController = async (request, response) => {
  const refreshToken = request.cookies[config.get('jwt.refreshCookieName')]

  const result = await refreshAccess(refreshToken, getRequestContext(request))

  setRefreshCookie(response, result.refreshToken)

  response.status(StatusCodes.OK).json({
    data: {
      accessToken: result.accessToken,
      user: result.user
    }
  })
}

const logoutController = async (request, response) => {
  const refreshToken = request.cookies[config.get('jwt.refreshCookieName')]

  await logout(refreshToken)
  clearRefreshCookie(response)

  response.status(StatusCodes.NO_CONTENT).send()
}

const meController = async (request, response) => {
  response.status(StatusCodes.OK).json({
    data: {
      user: serializeAuthUser(request.currentUser)
    }
  })
}

export { loginController, logoutController, meController, refreshController }
