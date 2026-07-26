const dotenv = require('dotenv')

dotenv.config()

const common = {
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'project_management',
  host: process.env.DB_WRITE_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 5432),
  dialect: 'postgres',
  logging: process.env.DB_LOGGING === 'true'
}

module.exports = {
  development: common,
  test: {
    ...common,
    database: `${common.database}_test`,
    logging: false
  },
  staging: common,
  production: {
    ...common,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  }
}
