import { body, param, query } from 'express-validator'

const feedbackTypes = [
  'manager',
  'team_lead',
  'client',
  'project_completion',
  'periodic_review',
  'self_reflection'
]
const ratingFields = [
  'deliveryRating',
  'qualityRating',
  'collaborationRating',
  'ownershipRating'
]

const feedbackId = () =>
  param('feedbackId').isUUID().withMessage('Enter a valid feedback ID')

const feedbackFields = ({ optional = false } = {}) => {
  const fields = [
    body('feedbackType')
      .isIn(feedbackTypes)
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
    body('projectId').isUUID().withMessage('Select a valid project'),
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
      .withMessage('Select a valid visibility'),
    ...ratingFields.map(field =>
      body(field)
        .optional({ nullable: true })
        .isInt({ min: 1, max: 5 })
        .withMessage('Ratings must be between 1 and 5')
    )
  ]

  return optional ? fields.map(validation => validation.optional()) : fields
}

const feedbackValidators = {
  create: () => feedbackFields(),
  delete: () => [feedbackId()],
  list: () => [
    query('feedbackType')
      .optional()
      .isIn(feedbackTypes)
      .withMessage('Select a valid feedback type'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be greater than zero'),
    query('projectId')
      .optional()
      .isUUID()
      .withMessage('Select a valid project'),
    query('search')
      .optional()
      .trim()
      .isLength({ min: 1, max: 180 })
      .withMessage('Search must contain between 1 and 180 characters'),
    query('status')
      .optional()
      .isIn(['draft', 'published', 'acknowledged'])
      .withMessage('Select a valid feedback status'),
    query('subjectUserId')
      .optional()
      .isUUID()
      .withMessage('Select a valid team member')
  ],
  update: () => [
    feedbackId(),
    ...feedbackFields({ optional: true }),
    body('employeeResponse')
      .optional({ nullable: true, checkFalsy: true })
      .trim()
      .isLength({ max: 4000 })
      .withMessage('Response cannot exceed 4000 characters')
  ]
}

export default feedbackValidators
