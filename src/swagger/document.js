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
    '/auth/login': {
      post: {
        summary: 'Sign in with an invited account',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: {
                    type: 'string',
                    format: 'email'
                  },
                  password: {
                    type: 'string',
                    format: 'password'
                  }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Authenticated user and short-lived access token'
          },
          401: {
            description: 'Invalid credentials'
          }
        }
      }
    },
    '/auth/refresh': {
      post: {
        summary: 'Rotate the refresh session and issue a new access token',
        tags: ['Authentication'],
        responses: {
          200: {
            description: 'Rotated session'
          },
          401: {
            description: 'Inactive or expired refresh session'
          }
        }
      }
    },
    '/auth/logout': {
      post: {
        summary: 'Revoke the current refresh session',
        tags: ['Authentication'],
        responses: {
          204: {
            description: 'Signed out'
          }
        }
      }
    },
    '/auth/me': {
      get: {
        summary: 'Get the authenticated user',
        security: [{ bearerAuth: [] }],
        tags: ['Authentication'],
        responses: {
          200: {
            description: 'Current user'
          },
          401: {
            description: 'Authentication required'
          }
        }
      }
    },
    '/dashboard/overview': {
      get: {
        summary: 'Get the manager portfolio overview',
        security: [{ bearerAuth: [] }],
        tags: ['Dashboard'],
        responses: {
          200: {
            description: 'Portfolio metrics, projects and attention items'
          },
          403: {
            description: 'Manager dashboard permission required'
          }
        }
      }
    },
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
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    }
  }
}

export default swaggerDocument
