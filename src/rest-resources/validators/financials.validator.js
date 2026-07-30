import { query } from 'express-validator'

const financialsValidators = {
  list: () => [
    query('contractType')
      .optional()
      .trim()
      .isLength({ min: 1, max: 48 })
      .withMessage('Select a valid contract type'),
    query('financialStatus')
      .optional()
      .isIn([
        'healthy',
        'outstanding',
        'past_due',
        'no_billing',
        'no_contract'
      ])
      .withMessage('Select a valid financial status'),
    query('projectId')
      .optional()
      .isUUID()
      .withMessage('Select a valid project'),
    query('search')
      .optional()
      .trim()
      .isLength({ min: 1, max: 180 })
      .withMessage('Search must contain between 1 and 180 characters')
  ]
}

export default financialsValidators
