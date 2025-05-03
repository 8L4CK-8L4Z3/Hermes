import { body, param, query } from 'express-validator';

export const validatePagination = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt()
];

export const validateObjectId = (paramName) => [
  param(paramName).isMongoId().withMessage('Invalid ID format')
];

export const validateAuth = {
  register: [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }).trim(),
    body('username').isLength({ min: 3 }).trim()
  ],
  login: [
    body('email').isEmail().normalizeEmail(),
    body('password').exists()
  ]
};

export const validateUser = {
  updateProfile: [
    body('username').optional().isLength({ min: 3 }).trim(),
    body('bio').optional().isString().trim()
  ]
};

export const validateContent = {
  comment: [
    body('content').trim().notEmpty().isLength({ max: 1000 })
  ],
  report: [
    body('reason').trim().notEmpty().isLength({ max: 1000 }),
    body('report_type').isIn(['spam', 'inappropriate', 'offensive', 'other']),
    body('target_type').isIn(['user', 'experience', 'comment', 'activity'])
  ]
};

export const validatePreference = {
  set: [
    body('category').trim().notEmpty(),
    body('preference_value').exists()
  ],
  bulk: [
    body('preferences').isArray(),
    body('preferences.*.category').trim().notEmpty(),
    body('preferences.*.preference_value').exists()
  ]
}; 