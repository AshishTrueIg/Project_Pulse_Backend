const swaggerDocument = {
  openapi: '3.0.3',
  info: {
    title: 'Project Management API',
    version: '0.1.0',
    description: 'Internal project, team, feedback, milestone, health and financial management API'
  },
  servers: [
    {
      url: '/api/v1',
      description: 'Current API version'
    }
  ],
  paths: {
    '/health': {
      get: {
        summary: 'Service health',
        tags: ['System'],
        responses: {
          200: {
            description: 'Service is healthy'
          }
        }
      }
    }
  }
}

export default swaggerDocument
