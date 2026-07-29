import { body, param, query } from 'express-validator'

const projectId = () =>
  param('projectId').isUUID().withMessage('Enter a valid project ID')

const identifier = (name, label) =>
  param(name).isUUID().withMessage(`Enter a valid ${label} ID`)

const list = () => [
  query('health')
    .optional()
    .isIn(['green', 'amber', 'red', 'not_assessed'])
    .withMessage('Enter a valid project health'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be greater than zero'),
  query('search')
    .optional()
    .trim()
    .isLength({ min: 1, max: 180 })
    .withMessage('Search must contain between 1 and 180 characters'),
  query('stage')
    .optional()
    .trim()
    .isLength({ min: 1, max: 64 })
    .withMessage('Enter a valid project stage'),
  query('status')
    .optional()
    .isIn(['active', 'upcoming', 'on_hold', 'maintenance', 'completed'])
    .withMessage('Enter a valid project status')
]

const projectFields = ({ optional = false } = {}) => {
  const fields = [
    body('clientId').isUUID().withMessage('Select a valid client'),
    body('code')
      .trim()
      .isLength({ min: 2, max: 40 })
      .withMessage('Project code must contain between 2 and 40 characters'),
    body('managerUserId').isUUID().withMessage('Select a valid project manager'),
    body('name')
      .trim()
      .isLength({ min: 2, max: 180 })
      .withMessage('Project name must contain between 2 and 180 characters'),
    body('overallHealth')
      .isIn(['green', 'amber', 'red', 'not_assessed'])
      .withMessage('Select a valid project health'),
    body('stage')
      .isIn([
        'draft',
        'planning',
        'active_development',
        'mvp_review',
        'scope_completed',
        'maintenance_retainer',
        'closed',
        'on_hold'
      ])
      .withMessage('Select a valid project stage'),
    body('startDate').isISO8601().withMessage('Enter a valid start date'),
    body('status')
      .isIn(['active', 'upcoming', 'on_hold', 'maintenance', 'completed'])
      .withMessage('Select a valid project status'),
    body('targetEndDate')
      .optional({ nullable: true, checkFalsy: true })
      .isISO8601()
      .withMessage('Enter a valid target end date')
  ]

  return optional ? fields.map(validation => validation.optional()) : fields
}

const milestoneFields = () => [
  body('acceptanceCriteria')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 4000 })
    .withMessage('Acceptance criteria cannot exceed 4000 characters'),
  body('dueDate').isISO8601().withMessage('Enter a valid due date'),
  body('milestoneType')
    .isIn(['milestone', 'mvp'])
    .withMessage('Select a valid milestone type'),
  body('name')
    .trim()
    .isLength({ min: 2, max: 180 })
    .withMessage('Milestone name must contain between 2 and 180 characters'),
  body('ownerUserId').isUUID().withMessage('Select a valid milestone owner'),
  body('status')
    .isIn([
      'planned',
      'in_progress',
      'ready_for_review',
      'changes_requested',
      'completed',
      'accepted'
    ])
    .withMessage('Select a valid milestone status')
]

const memberFields = () => [
  body('isDedicated').isBoolean().withMessage('Select a dedication type'),
  body('joinedAt').isISO8601().withMessage('Enter a valid joined date'),
  body('projectRole')
    .trim()
    .isLength({ min: 2, max: 160 })
    .withMessage('Project role must contain between 2 and 160 characters'),
  body('responsibilities')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 4000 })
    .withMessage('Responsibilities cannot exceed 4000 characters'),
  body('userId').isUUID().withMessage('Select a valid team member'),
  body('workloadSignal')
    .isIn(['light', 'normal', 'heavy', 'overloaded'])
    .withMessage('Select a valid workload signal')
]

const riskFields = () => [
  body('description')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 4000 })
    .withMessage('Risk description cannot exceed 4000 characters'),
  body('ownerUserId').isUUID().withMessage('Select a valid risk owner'),
  body('severity')
    .isIn(['low', 'medium', 'high', 'critical'])
    .withMessage('Select a valid severity'),
  body('status')
    .isIn(['open', 'mitigating', 'resolved', 'accepted'])
    .withMessage('Select a valid risk status'),
  body('targetDate')
    .optional({ nullable: true, checkFalsy: true })
    .isISO8601()
    .withMessage('Enter a valid target date'),
  body('title')
    .trim()
    .isLength({ min: 2, max: 220 })
    .withMessage('Risk title must contain between 2 and 220 characters')
]

const healthUpdateFields = () => [
  body('accomplishments')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 4000 })
    .withMessage('Accomplishments cannot exceed 4000 characters'),
  body('blockers')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 4000 })
    .withMessage('Blockers cannot exceed 4000 characters'),
  body('health')
    .isIn(['green', 'amber', 'red', 'not_assessed'])
    .withMessage('Select a valid project health'),
  body('nextSteps')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 4000 })
    .withMessage('Next steps cannot exceed 4000 characters'),
  body('summary')
    .trim()
    .isLength({ min: 2, max: 4000 })
    .withMessage('Summary must contain between 2 and 4000 characters')
]

const feedbackFields = ({ optional = false } = {}) => {
  const fields = [
    body('feedbackType')
      .isIn([
        'manager',
        'team_lead',
        'client',
        'project_completion',
        'periodic_review',
        'self_reflection'
      ])
      .withMessage('Select a valid feedback type'),
    body('goals')
      .optional({ nullable: true, checkFalsy: true })
      .trim()
      .isLength({ max: 4000 })
      .withMessage('Goals cannot exceed 4000 characters'),
    body('improvementAreas')
      .optional({ nullable: true, checkFalsy: true })
      .trim()
      .isLength({ max: 4000 })
      .withMessage('Improvement areas cannot exceed 4000 characters'),
    body('collaborationRating')
      .optional({ nullable: true })
      .isInt({ min: 1, max: 5 })
      .withMessage('Collaboration rating must be between 1 and 5'),
    body('deliveryRating')
      .optional({ nullable: true })
      .isInt({ min: 1, max: 5 })
      .withMessage('Delivery rating must be between 1 and 5'),
    body('ownershipRating')
      .optional({ nullable: true })
      .isInt({ min: 1, max: 5 })
      .withMessage('Ownership rating must be between 1 and 5'),
    body('qualityRating')
      .optional({ nullable: true })
      .isInt({ min: 1, max: 5 })
      .withMessage('Quality rating must be between 1 and 5'),
    body('reviewPeriod')
      .trim()
      .isLength({ min: 2, max: 120 })
      .withMessage('Review period must contain between 2 and 120 characters'),
    body('status')
      .isIn(['draft', 'published'])
      .withMessage('Select a valid feedback status'),
    body('strengths')
      .optional({ nullable: true, checkFalsy: true })
      .trim()
      .isLength({ max: 4000 })
      .withMessage('Strengths cannot exceed 4000 characters'),
    body('subjectUserId').isUUID().withMessage('Select a valid team member'),
    body('summary')
      .trim()
      .isLength({ min: 2, max: 6000 })
      .withMessage('Summary must contain between 2 and 6000 characters'),
    body('visibility')
      .isIn(['employee_and_managers', 'managers_only'])
      .withMessage('Select a valid visibility')
  ]

  return optional ? fields.map(validation => validation.optional()) : fields
}

const contractFields = () => [
  body('agreedAmount')
    .isFloat({ min: 0 })
    .withMessage('Agreed amount must be zero or greater'),
  body('billingFrequency')
    .isIn(['monthly', 'quarterly', 'milestone', 'one_time', 'custom'])
    .withMessage('Select a valid billing frequency'),
  body('contractType')
    .isIn([
      'dedicated_monthly',
      'time_and_material',
      'fixed_price',
      'milestone_based',
      'maintenance_retainer',
      'other'
    ])
    .withMessage('Select a valid contract type'),
  body('currency')
    .trim()
    .isLength({ min: 3, max: 3 })
    .withMessage('Currency must be a 3-letter code'),
  body('endDate')
    .optional({ nullable: true, checkFalsy: true })
    .isISO8601()
    .withMessage('Enter a valid contract end date'),
  body('notes')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 4000 })
    .withMessage('Notes cannot exceed 4000 characters'),
  body('startDate').isISO8601().withMessage('Enter a valid contract start date')
]

const billingFields = () => [
  body('amountCollected')
    .isFloat({ min: 0 })
    .withMessage('Collected amount must be zero or greater'),
  body('amountInvoiced')
    .isFloat({ min: 0 })
    .withMessage('Invoiced amount must be zero or greater'),
  body('approvedInternalCost')
    .isFloat({ min: 0 })
    .withMessage('Internal cost must be zero or greater'),
  body('expectedPaymentDate')
    .optional({ nullable: true, checkFalsy: true })
    .isISO8601()
    .withMessage('Enter a valid expected payment date'),
  body('invoiceReference')
    .trim()
    .isLength({ min: 1, max: 120 })
    .withMessage('Invoice reference is required'),
  body('notes')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 4000 })
    .withMessage('Notes cannot exceed 4000 characters'),
  body('otherExpenses')
    .isFloat({ min: 0 })
    .withMessage('Other expenses must be zero or greater'),
  body('periodEnd').isISO8601().withMessage('Enter a valid period end date'),
  body('periodStart').isISO8601().withMessage('Enter a valid period start date')
]

const projectValidators = {
  billingCreate: () => [projectId(), ...billingFields()],
  billingUpdate: () => [
    projectId(),
    identifier('billingRecordId', 'billing record'),
    ...billingFields()
  ],
  contractUpsert: () => [projectId(), ...contractFields()],
  feedbackCreate: () => [projectId(), ...feedbackFields()],
  feedbackList: () => [projectId()],
  feedbackUpdate: () => [
    projectId(),
    identifier('feedbackId', 'feedback'),
    ...feedbackFields({ optional: true }),
    body('employeeResponse')
      .optional({ nullable: true, checkFalsy: true })
      .trim()
      .isLength({ max: 4000 })
      .withMessage('Response cannot exceed 4000 characters')
  ],
  financialsGet: () => [projectId()],
  get: () => [projectId()],
  healthUpdateCreate: () => [projectId(), ...healthUpdateFields()],
  list,
  memberCreate: () => [projectId(), ...memberFields()],
  memberDeactivate: () => [
    projectId(),
    identifier('assignmentId', 'assignment'),
    body('leftAt')
      .optional({ nullable: true, checkFalsy: true })
      .isISO8601()
      .withMessage('Enter a valid end date')
  ],
  memberUpdate: () => [
    projectId(),
    identifier('assignmentId', 'assignment'),
    ...memberFields()
  ],
  milestoneCreate: () => [projectId(), ...milestoneFields()],
  milestoneUpdate: () => [
    projectId(),
    identifier('milestoneId', 'milestone'),
    ...milestoneFields()
  ],
  projectCreate: () => projectFields(),
  projectUpdate: () => [projectId(), ...projectFields({ optional: true })],
  riskCreate: () => [projectId(), ...riskFields()],
  riskUpdate: () => [
    projectId(),
    identifier('riskId', 'risk'),
    ...riskFields()
  ]
}

export default projectValidators
