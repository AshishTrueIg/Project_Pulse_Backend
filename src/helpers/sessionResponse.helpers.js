import config from '@src/configs/app.config'

import { sendNoContent, sendResponse } from './response.helpers'

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

const getRefreshToken = request =>
  request.cookies[config.get('jwt.refreshCookieName')] || null

const sendSessionResponse = ({ response }, result) => {
  const { refreshToken, ...session } = result

  setRefreshCookie(response, refreshToken)
  sendResponse({ response }, session)
}

const sendLogoutResponse = ({ response }) => {
  clearRefreshCookie(response)
  sendNoContent({ response })
}

export {
  getRefreshToken,
  sendLogoutResponse,
  sendSessionResponse
}
