import config from '@src/configs/app.config'
import BaseHandler from '@src/libs/baseHandler'

class GetHealthService extends BaseHandler {
  async run () {
    return {
      service: config.get('app.name'),
      version: config.get('app.version'),
      environment: config.get('env'),
      status: 'ok',
      timestamp: new Date().toISOString()
    }
  }
}

export default GetHealthService
