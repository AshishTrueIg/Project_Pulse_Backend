import config from '@src/configs/app.config'

const getHealth = () => ({
  service: config.get('app.name'),
  version: config.get('app.version'),
  environment: config.get('env'),
  status: 'ok',
  timestamp: new Date().toISOString()
})

export default getHealth
