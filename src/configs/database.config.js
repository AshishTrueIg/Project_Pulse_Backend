import config from './app.config'

const databaseConfig = {
  username: config.get('db.username'),
  password: config.get('db.password'),
  database: config.get('db.name'),
  host: config.get('db.host'),
  port: config.get('db.port'),
  dialect: 'postgres',
  logging: config.get('db.logging') ? console.log : false,
  define: {
    underscored: true,
    timestamps: true
  }
}

export default {
  development: databaseConfig,
  test: {
    ...databaseConfig,
    database: `${config.get('db.name')}_test`,
    logging: false
  },
  staging: databaseConfig,
  production: {
    ...databaseConfig,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  }
}
