import { StatusCodes } from 'http-status-codes'

import AppError from '@src/errors/app.error'
import BaseHandler from '@src/libs/baseHandler'

const createContext = () => ({
  logger: {
    error: jest.fn(),
    info: jest.fn()
  },
  traceId: 'test-trace-id'
})

describe('BaseHandler', () => {
  it('executes the service run method with args and context', async () => {
    class ExampleService extends BaseHandler {
      async run () {
        return {
          args: this.args,
          traceId: this.traceId
        }
      }
    }

    await expect(
      ExampleService.execute(
        {
          projectId: 'project-1'
        },
        createContext()
      )
    ).resolves.toEqual({
      args: {
        projectId: 'project-1'
      },
      traceId: 'test-trace-id'
    })
  })

  it('preserves operational application errors', async () => {
    const expectedError = new AppError(
      'Project was not found',
      StatusCodes.NOT_FOUND,
      null,
      {
        code: 'PROJECT_NOT_FOUND'
      }
    )

    class MissingProjectService extends BaseHandler {
      async run () {
        throw expectedError
      }
    }

    await expect(
      MissingProjectService.execute({}, createContext())
    ).rejects.toBe(expectedError)
  })

  it('normalizes unknown errors before they reach the controller', async () => {
    class BrokenService extends BaseHandler {
      async run () {
        throw new Error('database connection failed')
      }
    }

    await expect(
      BrokenService.execute({}, createContext())
    ).rejects.toEqual(
      expect.objectContaining({
        code: 'INTERNAL_ERROR',
        message: 'Internal server error',
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR
      })
    )
  })
})
