const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { verifyToken } = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public (Can be restricted in production as needed)
 */
router.post(
  '/register',
  [
    body('username')
      .trim()
      .isLength({ min: 3 })
      .withMessage('Username must be at least 3 characters long.')
      .matches(/^[A-Za-z0-9_]+$/)
      .withMessage('Username can only contain letters, numbers, and underscores.'),
    body('email')
      .trim()
      .isEmail()
      .withMessage('Please provide a valid email address.')
      .normalizeEmail(),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long.'),
    body('role')
      .optional()
      .isIn(['admin', 'manager', 'employee'])
      .withMessage('Role must be one of: admin, manager, employee.')
  ],
  authController.register
);

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user & get token
 * @access  Public
 */
router.post(
  '/login',
  [
    body('identifier')
      .trim()
      .notEmpty()
      .withMessage('Please enter your email or username.'),
    body('password')
      .notEmpty()
      .withMessage('Please enter your password.')
  ],
  authController.login
);

/**
 * @route   GET /api/auth/me
 * @desc    Get currently logged in user info
 * @access  Private
 */
router.get('/me', verifyToken, authController.getMe);

/**
 * @route   POST /api/auth/logout
 * @desc    Log out of session (audit log action)
 * @access  Private
 */
router.post('/logout', verifyToken, authController.logout);

module.exports = router;
