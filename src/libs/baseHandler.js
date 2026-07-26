import { StatusCodes } from 'http-status-codes'

import AppError from '@src/errors/app.error'
import logger from '@src/utils/logger'

/**
 * Shared execution contract for application services.
 *
 * Endpoint-facing services extend this class and implement run(). Controllers
 * only translate HTTP input/output; business logic belongs in handlers.
 */
class BaseHandler {
  constructor (args = {}, context = {}) {
    this.args = args
    this.context = context
    this.dbTransaction = context.sequelizeTransaction || null
    this.logger = context.logger || logger
    this.models = context.models
    this.traceId = context.traceId
  }

  static async execute (args = {}, context = {}) {
    const startedAt = Date.now()
    const handlerName = this.name
    const instance = new this(args, context)

    instance.logger.info(
      {
        handler: handlerName,
        traceId: instance.traceId,
        hasTransaction: Boolean(instance.dbTransaction)
      },
      'Handler execution started'
    )

    try {
      const result = await instance.run()

      instance.logger.info(
        {
          durationMs: Date.now() - startedAt,
          handler: handlerName,
          traceId: instance.traceId
        },
        'Handler execution completed'
      )

      return result
    } catch (error) {
      instance.logger.error(
        {
          durationMs: Date.now() - startedAt,
          error,
          handler: handlerName,
          traceId: instance.traceId
        },
        'Handler execution failed'
      )

      if (context.markTransactionForRollback) {
        context.markTransactionForRollback()
      }

      if (error instanceof AppError) {
        throw error
      }

      throw new AppError(
        'Internal server error',
        StatusCodes.INTERNAL_SERVER_ERROR,
        null,
        {
          cause: error,
          code: 'INTERNAL_ERROR'
        }
      )
    }
  }

  async run () {
    throw new AppError(
      `${this.constructor.name} must implement run()`,
      StatusCodes.INTERNAL_SERVER_ERROR,
      null,
      {
        code: 'HANDLER_NOT_IMPLEMENTED'
      }
    )
  }

  async callHandler (HandlerClass, args = {}) {
    return HandlerClass.execute(args, this.context)
  }
}

export default BaseHandler
