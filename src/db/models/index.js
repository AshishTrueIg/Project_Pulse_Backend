import { Sequelize } from 'sequelize'

import config from '@src/configs/app.config'

const sequelize = new Sequelize(
  config.get('db.name'),
  config.get('db.username'),
  config.get('db.password'),
  {
    host: config.get('db.host'),
    port: config.get('db.port'),
    dialect: 'postgres',
    logging: config.get('db.logging') ? console.log : false,
    define: {
      underscored: true,
      timestamps: true
    }
  }
)

export { sequelize }
