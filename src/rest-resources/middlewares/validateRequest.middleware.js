import { validationResult } from 'express-validator'
import { StatusCodes } from 'http-status-codes'

import AppError from '@src/errors/app.error'

const validateRequest = (request, response, next) => {
  const errors = validationResult(request)

  if (!errors.isEmpty()) {
    return next(
      new AppError('The request contains invalid fields', StatusCodes.UNPROCESSABLE_ENTITY, {
        fields: errors.array().map(error => ({
          field: error.path,
          message: error.msg
        }))
      })
    )
  }

  next()
}

export default validateRequest
