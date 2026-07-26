import convict from 'convict'
import dotenv from 'dotenv'

dotenv.config()

const config = convict({
  app: {
    name: {
      doc: 'Name of the service',
      format: String,
      default: 'project-management-backend',
      env: 'APP_NAME'
    },
    version: {
      doc: 'Version of the service',
      format: String,
      default: '0.1.0'
    }
  },
  env: {
    doc: 'Application environment',
    format: ['production', 'development', 'staging', 'test'],
    default: 'development',
    env: 'NODE_ENV'
  },
  port: {
    doc: 'HTTP port',
    format: 'port',
    default: 4001,
    env: 'PORT'
  },
  frontendUrl: {
    doc: 'Allowed admin frontend origin',
    format: String,
    default: 'http://localhost:3000',
    env: 'APP_ADMIN_FRONTEND_URL'
  },
  db: {
    name: {
      format: String,
      default: 'project_management',
      env: 'DB_NAME'
    },
    username: {
      format: String,
      default: 'postgres',
      env: 'DB_USERNAME'
    },
    password: {
      format: String,
      default: 'postgres',
      env: 'DB_PASSWORD',
      sensitive: true
    },
    host: {
      format: String,
      default: '127.0.0.1',
      env: 'DB_WRITE_HOST'
    },
    port: {
      format: 'port',
      default: 5432,
      env: 'DB_PORT'
    },
    logging: {
      format: Boolean,
      default: false,
      env: 'DB_LOGGING'
    }
  },
  jwt: {
    accessSecret: {
      format: String,
      default: 'development-access-secret',
      env: 'JWT_ACCESS_SECRET',
      sensitive: true
    },
    refreshSecret: {
      format: String,
      default: 'development-refresh-secret',
      env: 'JWT_REFRESH_SECRET',
      sensitive: true
    },
    accessExpiresIn: {
      format: String,
      default: '15m',
      env: 'JWT_ACCESS_EXPIRES_IN'
    },
    refreshExpiresIn: {
      format: String,
      default: '7d',
      env: 'JWT_REFRESH_EXPIRES_IN'
    },
    refreshCookieName: {
      format: String,
      default: 'projectPulseRefreshToken',
      env: 'JWT_REFRESH_COOKIE_NAME'
    },
    refreshCookieMaxAgeMs: {
      format: 'nat',
      default: 604800000,
      env: 'JWT_REFRESH_COOKIE_MAX_AGE_MS'
    }
  },
  swagger: {
    enabled: {
      format: Boolean,
      default: true,
      env: 'SWAGGER_ENABLED'
    },
    path: {
      format: String,
      default: '/api-docs',
      env: 'SWAGGER_PATH'
    }
  }
})

config.validate({ allowed: 'strict' })

export default config
