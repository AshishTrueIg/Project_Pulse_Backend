import { body, query } from 'express-validator'

const integerBetween = (path, minimum, maximum) =>
  body(path)
    .isInt({ min: minimum, max: maximum })
    .withMessage(`Must be a whole number between ${minimum} and ${maximum}`)
    .toInt()

const settingsValidators = {
  updateCompany: () => [
    body('name')
      .trim()
      .isLength({ min: 2, max: 160 })
      .withMessage('Company name must contain between 2 and 160 characters'),
    body('timezone')
      .trim()
      .isLength({ min: 1, max: 80 })
      .withMessage('Select a valid timezone'),
    body('currency')
      .trim()
      .isLength({ min: 3, max: 3 })
      .isAlpha()
      .withMessage('Currency must be a three-letter code'),
    integerBetween('reportingCadenceDays', 1, 30)
  ],
  updateHealthPolicy: () => [
    integerBetween('weights.managerAssessment', 0, 100),
    integerBetween('weights.milestoneDelivery', 0, 100),
    integerBetween('weights.riskExposure', 0, 100),
    integerBetween('weights.reportingFreshness', 0, 100),
    integerBetween('thresholds.green', 1, 99),
    integerBetween('thresholds.amber', 1, 99)
  ],
  activity: () => [
    query('action')
      .optional()
      .trim()
      .isLength({ min: 1, max: 120 })
      .withMessage('Select a valid action'),
    query('entityType')
      .optional()
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Select a valid entity type'),
    query('search')
      .optional()
      .trim()
      .isLength({ min: 1, max: 180 })
      .withMessage('Search must contain between 1 and 180 characters'),
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive number')
      .toInt(),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100')
      .toInt()
  ]
}

export default settingsValidators
