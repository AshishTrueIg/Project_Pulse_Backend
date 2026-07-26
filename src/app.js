import bodyParser from 'body-parser'
import compression from 'compression'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import morgan from 'morgan'
import swaggerUi from 'swagger-ui-express'

import config from '@src/configs/app.config'
import errorHandler from '@src/rest-resources/middlewares/errorHandler.middleware'
import contextMiddleware from '@src/rest-resources/middlewares/context.middleware'
import notFoundHandler from '@src/rest-resources/middlewares/notFound.middleware'
import apiRoutes from '@src/rest-resources/routes/api'
import swaggerDocument from '@src/swagger/document'

const app = express()

app.disable('x-powered-by')
app.use(helmet())
app.use(compression())
app.use(
  cors({
    origin: config.get('frontendUrl'),
    credentials: true
  })
)
app.use(bodyParser.json({ limit: '2mb' }))
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(contextMiddleware)
app.use(morgan(config.get('env') === 'production' ? 'combined' : 'dev'))

if (config.get('swagger.enabled')) {
  app.use(config.get('swagger.path'), swaggerUi.serve, swaggerUi.setup(swaggerDocument))
}

app.use('/api', apiRoutes)
app.use(notFoundHandler)
app.use(errorHandler)

export default app
