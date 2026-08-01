import { body, param, query } from 'express-validator'

const invitationId = () =>
  param('invitationId')
    .isUUID()
    .withMessage('Enter a valid invitation ID')

const token = () =>
  body('token')
    .isString()
    .matches(/^[a-f0-9]{64}$/)
    .withMessage('Enter a valid invitation token')

const invitationsValidators = {
  list: () => [
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100')
      .toInt(),
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be greater than zero')
      .toInt(),
    query('search')
      .optional()
      .trim()
      .isLength({ min: 1, max: 180 })
      .withMessage('Search must contain between 1 and 180 characters'),
    query('status')
      .optional()
      .isIn(['pending', 'accepted', 'expired', 'revoked'])
      .withMessage('Select a valid invitation status')
  ],
  create: () => [
    body('email')
      .trim()
      .isEmail()
      .withMessage('Enter a valid work email')
      .isLength({ max: 255 })
      .withMessage('Email cannot exceed 255 characters')
      .normalizeEmail(),
    body('fullName')
      .trim()
      .isLength({ min: 2, max: 160 })
      .withMessage('Full name must contain between 2 and 160 characters'),
    body('jobTitle')
      .optional({ nullable: true })
      .trim()
      .isLength({ max: 160 })
      .withMessage('Job title cannot exceed 160 characters'),
    body('roleId')
      .isUUID()
      .withMessage('Select a valid access role'),
    body('managerUserId')
      .optional({ nullable: true, checkFalsy: true })
      .isUUID()
      .withMessage('Select a valid reporting manager'),
    body('employmentStartDate')
      .optional({ nullable: true, checkFalsy: true })
      .isISO8601()
      .withMessage('Enter a valid employment start date')
  ],
  resend: () => [invitationId()],
  revoke: () => [invitationId()],
  validate: () => [token()],
  accept: () => [
    token(),
    body('password')
      .isString()
      .isLength({ min: 8, max: 128 })
      .withMessage('Password must contain between 8 and 128 characters')
      .matches(/[a-z]/)
      .withMessage('Password must contain a lowercase letter')
      .matches(/[A-Z]/)
      .withMessage('Password must contain an uppercase letter')
      .matches(/[0-9]/)
      .withMessage('Password must contain a number')
      .matches(/[^A-Za-z0-9]/)
      .withMessage('Password must contain a special character'),
    body('passwordConfirmation')
      .isString()
      .custom((value, { req }) => value === req.body.password)
      .withMessage('Passwords do not match')
  ]
}

export default invitationsValidators
