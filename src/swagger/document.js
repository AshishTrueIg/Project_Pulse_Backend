const projectIdParameter = {
  in: 'path',
  name: 'projectId',
  required: true,
  schema: {
    type: 'string',
    format: 'uuid'
  }
}

const identifierParameter = name => ({
  in: 'path',
  name,
  required: true,
  schema: {
    type: 'string',
    format: 'uuid'
  }
})

const jsonBody = schema => ({
  required: true,
  content: {
    'application/json': {
      schema: {
        $ref: `#/components/schemas/${schema}`
      }
    }
  }
})

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
    '/people': {
      get: {
        summary: 'List visible people with project allocation and capacity signals',
        security: [{ bearerAuth: [] }],
        tags: ['People'],
        parameters: [
          {
            in: 'query',
            name: 'search',
            schema: {
              type: 'string'
            }
          },
          {
            in: 'query',
            name: 'role',
            schema: {
              type: 'string'
            }
          },
          {
            in: 'query',
            name: 'workload',
            schema: {
              type: 'string',
              enum: ['unallocated', 'light', 'normal', 'heavy', 'overloaded']
            }
          },
          {
            in: 'query',
            name: 'projectId',
            schema: {
              type: 'string',
              format: 'uuid'
            }
          },
          {
            in: 'query',
            name: 'status',
            schema: {
              type: 'string',
              enum: ['active', 'inactive']
            }
          }
        ],
        responses: {
          200: {
            description: 'Scoped people directory, capacity summary and pagination'
          },
          403: {
            description: 'People read permission required'
          }
        }
      }
    },
    '/people/options': {
      get: {
        summary: 'Get roles, managers and projects for people workflows',
        security: [{ bearerAuth: [] }],
        tags: ['People'],
        responses: {
          200: {
            description: 'People form and filter options'
          },
          403: {
            description: 'People write permission required'
          }
        }
      }
    },
    '/people/{personId}': {
      get: {
        summary: 'Get a person profile, assignments and visible feedback',
        security: [{ bearerAuth: [] }],
        tags: ['People'],
        parameters: [identifierParameter('personId')],
        responses: {
          200: {
            description: 'Person profile'
          },
          404: {
            description: 'Person is missing or outside the user scope'
          }
        }
      },
      patch: {
        summary: 'Update employment profile and access role',
        security: [{ bearerAuth: [] }],
        tags: ['People'],
        parameters: [identifierParameter('personId')],
        requestBody: jsonBody('PersonUpdate'),
        responses: {
          200: {
            description: 'Person profile updated and audited'
          },
          403: {
            description: 'People write permission required'
          }
        }
      }
    },
    '/feedback': {
      get: {
        summary: 'List feedback visible to the current role with workflow metrics',
        security: [{ bearerAuth: [] }],
        tags: ['Feedback'],
        parameters: [
          {
            in: 'query',
            name: 'search',
            schema: { type: 'string' }
          },
          {
            in: 'query',
            name: 'projectId',
            schema: { type: 'string', format: 'uuid' }
          },
          {
            in: 'query',
            name: 'feedbackType',
            schema: { type: 'string' }
          },
          {
            in: 'query',
            name: 'status',
            schema: {
              type: 'string',
              enum: ['draft', 'published', 'acknowledged']
            }
          }
        ],
        responses: {
          200: {
            description: 'Scoped review workflow, summary and pagination'
          }
        }
      },
      post: {
        summary: 'Create a project feedback draft or publish a complete review',
        security: [{ bearerAuth: [] }],
        tags: ['Feedback'],
        requestBody: jsonBody('FeedbackWrite'),
        responses: {
          201: {
            description: 'Feedback created and audited'
          },
          422: {
            description: 'Published review is incomplete or subject is not assigned'
          }
        }
      }
    },
    '/feedback/options': {
      get: {
        summary: 'Get scoped projects and active team members for review forms',
        security: [{ bearerAuth: [] }],
        tags: ['Feedback'],
        responses: {
          200: {
            description: 'Feedback type, project and team member options'
          },
          403: {
            description: 'Feedback management permission required'
          }
        }
      }
    },
    '/feedback/{feedbackId}': {
      patch: {
        summary: 'Update or publish a draft, or acknowledge feedback addressed to you',
        security: [{ bearerAuth: [] }],
        tags: ['Feedback'],
        parameters: [identifierParameter('feedbackId')],
        requestBody: jsonBody('FeedbackWrite'),
        responses: {
          200: {
            description: 'Feedback workflow updated and audited'
          },
          409: {
            description: 'Published review content is immutable'
          }
        }
      },
      delete: {
        summary: 'Discard an unpublished feedback draft',
        security: [{ bearerAuth: [] }],
        tags: ['Feedback'],
        parameters: [identifierParameter('feedbackId')],
        responses: {
          200: {
            description: 'Draft discarded and audited'
          },
          409: {
            description: 'Only draft feedback can be discarded'
          }
        }
      }
    },
    '/financials': {
      get: {
        summary: 'Get restricted portfolio contracts, billing and collection estimates',
        security: [{ bearerAuth: [] }],
        tags: ['Financials'],
        parameters: [
          {
            in: 'query',
            name: 'search',
            schema: { type: 'string' }
          },
          {
            in: 'query',
            name: 'projectId',
            schema: { type: 'string', format: 'uuid' }
          },
          {
            in: 'query',
            name: 'contractType',
            schema: { type: 'string' }
          },
          {
            in: 'query',
            name: 'financialStatus',
            schema: {
              type: 'string',
              enum: [
                'healthy',
                'outstanding',
                'past_due',
                'no_billing',
                'no_contract'
              ]
            }
          }
        ],
        responses: {
          200: {
            description: 'Portfolio totals, monthly trend, project health and recent billing'
          },
          403: {
            description: 'Financial permission required'
          }
        }
      }
    },
    '/projects': {
      get: {
        summary: 'List projects visible to the authenticated user',
        security: [{ bearerAuth: [] }],
        tags: ['Projects'],
        parameters: [
          {
            in: 'query',
            name: 'search',
            schema: {
              type: 'string'
            }
          },
          {
            in: 'query',
            name: 'health',
            schema: {
              type: 'string',
              enum: ['green', 'amber', 'red', 'not_assessed']
            }
          },
          {
            in: 'query',
            name: 'status',
            schema: {
              type: 'string'
            }
          },
          {
            in: 'query',
            name: 'stage',
            schema: {
              type: 'string'
            }
          },
          {
            in: 'query',
            name: 'page',
            schema: {
              type: 'integer',
              minimum: 1
            }
          },
          {
            in: 'query',
            name: 'limit',
            schema: {
              type: 'integer',
              minimum: 1,
              maximum: 100
            }
          }
        ],
        responses: {
          200: {
            description: 'Scoped project list, portfolio summary and pagination'
          },
          403: {
            description: 'Project read permission required'
          }
        }
      },
      post: {
        summary: 'Create a project',
        security: [{ bearerAuth: [] }],
        tags: ['Projects'],
        requestBody: jsonBody('ProjectWrite'),
        responses: {
          201: {
            description: 'Project created'
          },
          403: {
            description: 'Project write permission required'
          },
          409: {
            description: 'Project code already exists'
          }
        }
      }
    },
    '/projects/options': {
      get: {
        summary: 'Get clients, users and allowed project resource values',
        security: [{ bearerAuth: [] }],
        tags: ['Projects'],
        responses: {
          200: {
            description: 'Project form options'
          },
          403: {
            description: 'Project write permission required'
          }
        }
      }
    },
    '/projects/{projectId}': {
      get: {
        summary: 'Get a visible project with team, milestones and risk history',
        security: [{ bearerAuth: [] }],
        tags: ['Projects'],
        parameters: [projectIdParameter],
        responses: {
          200: {
            description: 'Project overview'
          },
          404: {
            description: 'Project is missing or outside the user scope'
          }
        }
      },
      patch: {
        summary: 'Update project details or assigned delivery state',
        security: [{ bearerAuth: [] }],
        tags: ['Projects'],
        parameters: [projectIdParameter],
        requestBody: jsonBody('ProjectWrite'),
        responses: {
          200: {
            description: 'Project updated'
          },
          403: {
            description: 'Core project or assigned update permission required'
          }
        }
      }
    },
    '/projects/{projectId}/milestones': {
      post: {
        summary: 'Create a milestone or MVP',
        security: [{ bearerAuth: [] }],
        tags: ['Milestones'],
        parameters: [projectIdParameter],
        requestBody: jsonBody('MilestoneWrite'),
        responses: {
          201: {
            description: 'Milestone created'
          }
        }
      }
    },
    '/projects/{projectId}/health-updates': {
      post: {
        summary: 'Submit a persistent weekly project health update',
        security: [{ bearerAuth: [] }],
        tags: ['Projects'],
        parameters: [projectIdParameter],
        requestBody: jsonBody('ProjectHealthUpdateWrite'),
        responses: {
          201: {
            description: 'Weekly update submitted and project health refreshed'
          },
          403: {
            description: 'Project update permission required'
          }
        }
      }
    },
    '/projects/{projectId}/milestones/{milestoneId}': {
      patch: {
        summary: 'Update milestone delivery or acceptance state',
        security: [{ bearerAuth: [] }],
        tags: ['Milestones'],
        parameters: [
          projectIdParameter,
          identifierParameter('milestoneId')
        ],
        requestBody: jsonBody('MilestoneWrite'),
        responses: {
          200: {
            description: 'Milestone updated and audited'
          }
        }
      }
    },
    '/projects/{projectId}/members': {
      post: {
        summary: 'Add a project team member',
        security: [{ bearerAuth: [] }],
        tags: ['Project team'],
        parameters: [projectIdParameter],
        requestBody: jsonBody('ProjectMemberWrite'),
        responses: {
          201: {
            description: 'Team member added'
          }
        }
      }
    },
    '/projects/{projectId}/members/{assignmentId}': {
      patch: {
        summary: 'Update a project team assignment',
        security: [{ bearerAuth: [] }],
        tags: ['Project team'],
        parameters: [
          projectIdParameter,
          identifierParameter('assignmentId')
        ],
        requestBody: jsonBody('ProjectMemberWrite'),
        responses: {
          200: {
            description: 'Assignment updated'
          }
        }
      },
      delete: {
        summary: 'End a project team assignment while retaining history',
        security: [{ bearerAuth: [] }],
        tags: ['Project team'],
        parameters: [
          projectIdParameter,
          identifierParameter('assignmentId')
        ],
        responses: {
          200: {
            description: 'Assignment ended'
          }
        }
      }
    },
    '/projects/{projectId}/risks': {
      post: {
        summary: 'Create a project risk or blocker',
        security: [{ bearerAuth: [] }],
        tags: ['Risks'],
        parameters: [projectIdParameter],
        requestBody: jsonBody('RiskWrite'),
        responses: {
          201: {
            description: 'Risk created'
          }
        }
      }
    },
    '/projects/{projectId}/risks/{riskId}': {
      patch: {
        summary: 'Update a risk, mitigation or resolution state',
        security: [{ bearerAuth: [] }],
        tags: ['Risks'],
        parameters: [
          projectIdParameter,
          identifierParameter('riskId')
        ],
        requestBody: jsonBody('RiskWrite'),
        responses: {
          200: {
            description: 'Risk updated'
          }
        }
      }
    },
    '/projects/{projectId}/feedback': {
      get: {
        summary: 'List feedback allowed by author/subject visibility',
        security: [{ bearerAuth: [] }],
        tags: ['Feedback'],
        parameters: [projectIdParameter],
        responses: {
          200: {
            description: 'Scoped project feedback'
          }
        }
      },
      post: {
        summary: 'Create a feedback draft or publish feedback',
        security: [{ bearerAuth: [] }],
        tags: ['Feedback'],
        parameters: [projectIdParameter],
        requestBody: jsonBody('FeedbackWrite'),
        responses: {
          201: {
            description: 'Feedback created'
          }
        }
      }
    },
    '/projects/{projectId}/feedback/{feedbackId}': {
      patch: {
        summary: 'Update a draft, publish it, or acknowledge own feedback',
        security: [{ bearerAuth: [] }],
        tags: ['Feedback'],
        parameters: [
          projectIdParameter,
          identifierParameter('feedbackId')
        ],
        requestBody: jsonBody('FeedbackWrite'),
        responses: {
          200: {
            description: 'Feedback updated'
          },
          409: {
            description: 'Published author text is immutable'
          }
        }
      }
    },
    '/projects/{projectId}/financials': {
      get: {
        summary: 'Get restricted contract, billing and calculated estimates',
        security: [{ bearerAuth: [] }],
        tags: ['Financials'],
        parameters: [projectIdParameter],
        responses: {
          200: {
            description: 'Project financials'
          },
          403: {
            description: 'Financial permission required'
          }
        }
      }
    },
    '/projects/{projectId}/financials/contract': {
      put: {
        summary: 'Create or update restricted project contract terms',
        security: [{ bearerAuth: [] }],
        tags: ['Financials'],
        parameters: [projectIdParameter],
        requestBody: jsonBody('ContractWrite'),
        responses: {
          200: {
            description: 'Contract saved and audited'
          }
        }
      }
    },
    '/projects/{projectId}/financials/billing-records': {
      post: {
        summary: 'Create a billing, collection and cost record',
        security: [{ bearerAuth: [] }],
        tags: ['Financials'],
        parameters: [projectIdParameter],
        requestBody: jsonBody('BillingWrite'),
        responses: {
          201: {
            description: 'Billing record created and audited'
          }
        }
      }
    },
    '/projects/{projectId}/financials/billing-records/{billingRecordId}': {
      patch: {
        summary: 'Update a billing, collection and cost record',
        security: [{ bearerAuth: [] }],
        tags: ['Financials'],
        parameters: [
          projectIdParameter,
          identifierParameter('billingRecordId')
        ],
        requestBody: jsonBody('BillingWrite'),
        responses: {
          200: {
            description: 'Billing record updated and audited'
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
    schemas: {
      ProjectWrite: {
        type: 'object',
        required: [
          'clientId',
          'code',
          'managerUserId',
          'name',
          'overallHealth',
          'stage',
          'startDate',
          'status'
        ],
        properties: {
          clientId: { type: 'string', format: 'uuid' },
          code: { type: 'string', maxLength: 40 },
          managerUserId: { type: 'string', format: 'uuid' },
          name: { type: 'string', maxLength: 180 },
          overallHealth: {
            type: 'string',
            enum: ['green', 'amber', 'red', 'not_assessed']
          },
          stage: {
            type: 'string',
            enum: [
              'draft',
              'planning',
              'active_development',
              'mvp_review',
              'scope_completed',
              'maintenance_retainer',
              'closed',
              'on_hold'
            ]
          },
          startDate: { type: 'string', format: 'date' },
          status: {
            type: 'string',
            enum: ['active', 'upcoming', 'on_hold', 'maintenance', 'completed']
          },
          targetEndDate: { type: 'string', format: 'date', nullable: true }
        }
      },
      ProjectHealthUpdateWrite: {
        type: 'object',
        required: ['health', 'summary'],
        properties: {
          accomplishments: {
            type: 'string',
            maxLength: 4000,
            nullable: true
          },
          blockers: {
            type: 'string',
            maxLength: 4000,
            nullable: true
          },
          health: {
            type: 'string',
            enum: ['green', 'amber', 'red', 'not_assessed']
          },
          nextSteps: {
            type: 'string',
            maxLength: 4000,
            nullable: true
          },
          summary: {
            type: 'string',
            minLength: 2,
            maxLength: 4000
          }
        }
      },
      PersonUpdate: {
        type: 'object',
        properties: {
          email: {
            type: 'string',
            format: 'email'
          },
          employeeCode: {
            type: 'string',
            nullable: true,
            maxLength: 40
          },
          employmentStartDate: {
            type: 'string',
            format: 'date',
            nullable: true
          },
          fullName: {
            type: 'string',
            minLength: 2,
            maxLength: 160
          },
          jobTitle: {
            type: 'string',
            nullable: true,
            maxLength: 160
          },
          managerUserId: {
            type: 'string',
            format: 'uuid',
            nullable: true
          },
          profileSummary: {
            type: 'string',
            nullable: true,
            maxLength: 3000
          },
          roleId: {
            type: 'string',
            format: 'uuid'
          },
          skills: {
            type: 'array',
            maxItems: 30,
            items: {
              type: 'string'
            }
          },
          status: {
            type: 'string',
            enum: ['active', 'inactive']
          },
          totalExperienceYears: {
            type: 'number',
            minimum: 0,
            maximum: 80,
            nullable: true
          }
        }
      },
      MilestoneWrite: {
        type: 'object',
        required: ['dueDate', 'milestoneType', 'name', 'ownerUserId', 'status'],
        properties: {
          acceptanceCriteria: { type: 'string', nullable: true },
          dueDate: { type: 'string', format: 'date' },
          milestoneType: { type: 'string', enum: ['milestone', 'mvp'] },
          name: { type: 'string' },
          ownerUserId: { type: 'string', format: 'uuid' },
          status: {
            type: 'string',
            enum: [
              'planned',
              'in_progress',
              'ready_for_review',
              'changes_requested',
              'completed',
              'accepted'
            ]
          }
        }
      },
      ProjectMemberWrite: {
        type: 'object',
        required: [
          'isDedicated',
          'joinedAt',
          'projectRole',
          'userId',
          'workloadSignal'
        ],
        properties: {
          isDedicated: { type: 'boolean' },
          joinedAt: { type: 'string', format: 'date' },
          projectRole: { type: 'string' },
          responsibilities: { type: 'string', nullable: true },
          userId: { type: 'string', format: 'uuid' },
          workloadSignal: {
            type: 'string',
            enum: ['light', 'normal', 'heavy', 'overloaded']
          }
        }
      },
      RiskWrite: {
        type: 'object',
        required: ['ownerUserId', 'severity', 'status', 'title'],
        properties: {
          description: { type: 'string', nullable: true },
          ownerUserId: { type: 'string', format: 'uuid' },
          severity: {
            type: 'string',
            enum: ['low', 'medium', 'high', 'critical']
          },
          status: {
            type: 'string',
            enum: ['open', 'mitigating', 'resolved', 'accepted']
          },
          targetDate: { type: 'string', format: 'date', nullable: true },
          title: { type: 'string' }
        }
      },
      FeedbackWrite: {
        type: 'object',
        properties: {
          collaborationRating: {
            type: 'integer',
            minimum: 1,
            maximum: 5,
            nullable: true
          },
          deliveryRating: {
            type: 'integer',
            minimum: 1,
            maximum: 5,
            nullable: true
          },
          employeeResponse: { type: 'string', nullable: true },
          feedbackType: { type: 'string' },
          goals: { type: 'string', nullable: true },
          improvementAreas: { type: 'string', nullable: true },
          ownershipRating: {
            type: 'integer',
            minimum: 1,
            maximum: 5,
            nullable: true
          },
          projectId: { type: 'string', format: 'uuid' },
          qualityRating: {
            type: 'integer',
            minimum: 1,
            maximum: 5,
            nullable: true
          },
          reviewPeriod: { type: 'string' },
          status: { type: 'string', enum: ['draft', 'published'] },
          strengths: { type: 'string', nullable: true },
          subjectUserId: { type: 'string', format: 'uuid' },
          summary: { type: 'string' },
          visibility: {
            type: 'string',
            enum: ['employee_and_managers', 'managers_only']
          }
        }
      },
      ContractWrite: {
        type: 'object',
        required: [
          'agreedAmount',
          'billingFrequency',
          'contractType',
          'currency',
          'startDate'
        ],
        properties: {
          agreedAmount: { type: 'number', minimum: 0 },
          billingFrequency: { type: 'string' },
          contractType: { type: 'string' },
          currency: { type: 'string', minLength: 3, maxLength: 3 },
          endDate: { type: 'string', format: 'date', nullable: true },
          notes: { type: 'string', nullable: true },
          startDate: { type: 'string', format: 'date' }
        }
      },
      BillingWrite: {
        type: 'object',
        required: [
          'amountCollected',
          'amountInvoiced',
          'approvedInternalCost',
          'invoiceReference',
          'otherExpenses',
          'periodEnd',
          'periodStart'
        ],
        properties: {
          amountCollected: { type: 'number', minimum: 0 },
          amountInvoiced: { type: 'number', minimum: 0 },
          approvedInternalCost: { type: 'number', minimum: 0 },
          expectedPaymentDate: { type: 'string', format: 'date', nullable: true },
          invoiceReference: { type: 'string' },
          notes: { type: 'string', nullable: true },
          otherExpenses: { type: 'number', minimum: 0 },
          periodEnd: { type: 'string', format: 'date' },
          periodStart: { type: 'string', format: 'date' }
        }
      }
    },
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
