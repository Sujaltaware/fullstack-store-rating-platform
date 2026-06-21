const { body } = require('express-validator');

const nameValidation = body('name')
  .trim()
  .isLength({ min: 20, max: 60 })
  .withMessage('Name must be between 20 and 60 characters');

const emailValidation = body('email')
  .trim()
  .isEmail()
  .withMessage('Please enter a valid email address')
  .normalizeEmail();

const addressValidation = body('address')
  .trim()
  .isLength({ max: 400 })
  .withMessage('Address must not exceed 400 characters')
  .notEmpty()
  .withMessage('Address is required');

const passwordValidation = body('password')
  .isLength({ min: 8, max: 16 })
  .withMessage('Password must be between 8 and 16 characters')
  .matches(/[A-Z]/)
  .withMessage('Password must contain at least one uppercase letter')
  .matches(/[!@#$%^&*(),.?":{}|<>]/)
  .withMessage('Password must contain at least one special character');

const roleValidation = body('role')
  .optional()
  .isIn(['admin', 'user', 'store_owner'])
  .withMessage('Role must be admin, user, or store_owner');

const ratingValidation = body('rating')
  .isInt({ min: 1, max: 5 })
  .withMessage('Rating must be between 1 and 5');

module.exports = {
  nameValidation,
  emailValidation,
  addressValidation,
  passwordValidation,
  roleValidation,
  ratingValidation,
};
