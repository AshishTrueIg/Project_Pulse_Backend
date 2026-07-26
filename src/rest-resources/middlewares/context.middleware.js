import { randomUUID } from 'crypto'

import db from '@src/db/models'
import logger from '@src/utils/logger'

const TRACE_ID_HEADER = 'x-trace-id'

const contextMiddleware = (request, response, next) => {
  const traceId = request.get(TRACE_ID_HEADER) || randomUUID()
  const requestLogger = logger.child({
    method: request.method,
    path: request.originalUrl,
    traceId
  })

  request.context = {
    auth: null,
    currentUser: null,
    logger: requestLogger,
    markTransactionForRollback: () => {},
    models: db,
    request: {
      ipAddress: request.ip,
      userAgent: request.get('user-agent')
    },
    requestStartedAt: Date.now(),
    sequelizeTransaction: null,
    traceId
  }

  response.setHeader(TRACE_ID_HEADER, traceId)
  next()
}

export default contextMiddleware
