import app from '@src/app'
import config from '@src/configs/app.config'
import logger from '@src/utils/logger'

const port = config.get('port')

const server = app.listen(port, () => {
  logger.info({ port }, 'Project management API started')
})

const shutdown = signal => {
  logger.info({ signal }, 'Shutting down API')

  server.close(error => {
    if (error) {
      logger.error({ error }, 'Failed to close HTTP server cleanly')
      process.exit(1)
    }

    process.exit(0)
  })
}

process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT', () => shutdown('SIGINT'))
