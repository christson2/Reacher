const { body, validationResult } = require('express-validator');

const signupRules = () => [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 100 }),
  body('phone').trim().notEmpty().withMessage('Phone is required')
    .matches(/^\+?[0-9\-\s]{7,15}$/).withMessage('Invalid phone number'),
  body('password').notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
];

const loginRules = () => [
  body('phone').trim().notEmpty().withMessage('Phone is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

const userUpdateRules = () => [
  body('name').optional().trim().isLength({ max: 100 }).withMessage('Name too long'),
  body('phone').optional().trim().matches(/^\+?[0-9\-\s]{7,15}$/).withMessage('Invalid phone number'),
];

const productRules = () => [
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 200 }),
  body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('description').optional().isLength({ max: 2000 }),
];

const requestRules = () => [
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 200 }),
  body('description').trim().notEmpty().withMessage('Description is required').isLength({ max: 4000 }),
  body('latitude').optional().isFloat({ min: -90, max: 90 }).withMessage('Invalid latitude'),
  body('longitude').optional().isFloat({ min: -180, max: 180 }).withMessage('Invalid longitude'),
];

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array().map(e => ({ field: e.param, msg: e.msg })) });
  }
  return next();
};

module.exports = {
  signupRules,
  loginRules,
  userUpdateRules,
  productRules,
  requestRules,
  validate,
};
