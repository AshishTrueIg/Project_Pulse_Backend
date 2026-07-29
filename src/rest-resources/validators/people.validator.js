import { body, param, query } from 'express-validator'

const personId = () =>
  param('personId').isUUID().withMessage('Enter a valid person ID')

const list = () => [
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
  query('role')
    .optional()
    .trim()
    .isLength({ min: 1, max: 80 })
    .withMessage('Select a valid role'),
  query('search')
    .optional()
    .trim()
    .isLength({ min: 1, max: 180 })
    .withMessage('Search must contain between 1 and 180 characters'),
  query('status')
    .optional()
    .isIn(['active', 'inactive'])
    .withMessage('Select a valid person status'),
  query('workload')
    .optional()
    .isIn(['unallocated', 'light', 'normal', 'heavy', 'overloaded'])
    .withMessage('Select a valid workload signal')
]

const update = () => [
  personId(),
  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Enter a valid work email')
    .isLength({ max: 255 })
    .withMessage('Email cannot exceed 255 characters'),
  body('employeeCode')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 40 })
    .withMessage('Employee code cannot exceed 40 characters'),
  body('employmentStartDate')
    .optional({ nullable: true, checkFalsy: true })
    .isISO8601()
    .withMessage('Enter a valid employment start date'),
  body('fullName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 160 })
    .withMessage('Full name must contain between 2 and 160 characters'),
  body('jobTitle')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 160 })
    .withMessage('Job title cannot exceed 160 characters'),
  body('managerUserId')
    .optional({ nullable: true, checkFalsy: true })
    .isUUID()
    .withMessage('Select a valid reporting manager'),
  body('profileSummary')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 3000 })
    .withMessage('Profile summary cannot exceed 3000 characters'),
  body('roleId')
    .optional()
    .isUUID()
    .withMessage('Select a valid role'),
  body('skills')
    .optional()
    .isArray({ max: 30 })
    .withMessage('Skills must be a list with up to 30 entries'),
  body('skills.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 80 })
    .withMessage('Each skill must contain between 1 and 80 characters'),
  body('status')
    .optional()
    .isIn(['active', 'inactive'])
    .withMessage('Select a valid person status'),
  body('totalExperienceYears')
    .optional({ nullable: true, checkFalsy: true })
    .isFloat({ min: 0, max: 80 })
    .withMessage('Experience must be between 0 and 80 years')
]

const peopleValidators = {
  get: () => [personId()],
  list,
  update
}

export default peopleValidators
