const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const AuditService = require('../services/auditService');
const { validationResult } = require('express-validator');

const authController = {
  /**
   * Register a new user
   */
  register: async (req, res, next) => {
    try {
      // 1. Validate inputs using express-validator
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { username, email, password, role } = req.body;

      // 2. Check if username or email already exists
      const existingEmail = await User.findByEmail(email);
      if (existingEmail) {
        return res.status(400).json({ 
          success: false, 
          message: 'Registration failed. A user with this email address already exists.' 
        });
      }

      const existingUsername = await User.findByUsername(username);
      if (existingUsername) {
        return res.status(400).json({ 
          success: false, 
          message: 'Registration failed. A user with this username already exists.' 
        });
      }

      // 3. Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // 4. Create user record
      const userId = await User.create({
        username,
        email,
        password: hashedPassword,
        role: role || 'employee'
      });

      // 5. Audit Log the registration (userId is the newly created user ID, action is 'USER_REGISTER')
      const createdUser = { id: userId, username, email, role: role || 'employee' };
      await AuditService.log(userId, 'USER_REGISTER', 'users', userId, null, { username, email, role: role || 'employee' });

      // 6. Return response
      return res.status(201).json({
        success: true,
        message: 'User registered successfully.',
        data: createdUser
      });

    } catch (err) {
      // Pass unique key constraint errors or general errors to express error handler
      next(err);
    }
  },

  /**
   * Login user
   */
  login: async (req, res, next) => {
    try {
      // 1. Validate inputs
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { identifier, password } = req.body; // identifier can be username OR email

      // 2. Resolve user by username or email
      let user = null;
      if (identifier.includes('@')) {
        user = await User.findByEmail(identifier);
      } else {
        user = await User.findByUsername(identifier);
      }

      if (!user) {
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid credentials. Please check your username/email and password.' 
        });
      }

      // 3. Match passwords
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid credentials. Please check your username/email and password.' 
        });
      }

      // 4. Generate JWT
      const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        process.env.JWT_SECRET || 'your_jwt_secret_key_here',
        { expiresIn: '24h' }
      );

      // 5. Audit Log the login
      await AuditService.log(user.id, 'USER_LOGIN', 'users', user.id, null, { login_time: new Date() });

      // 6. Return Response (excluding hashed password)
      return res.status(200).json({
        success: true,
        message: 'Login successful.',
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          created_at: user.created_at
        }
      });

    } catch (err) {
      next(err);
    }
  },

  /**
   * Get current authenticated user profile
   */
  getMe: async (req, res, next) => {
    try {
      // req.user is set by verifyToken middleware
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ 
          success: false, 
          message: 'User profile not found.' 
        });
      }

      return res.status(200).json({
        success: true,
        user
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Logout user (Audit-only)
   */
  logout: async (req, res, next) => {
    try {
      if (req.user) {
        // Audit log the logout
        await AuditService.log(req.user.id, 'USER_LOGOUT', 'users', req.user.id, null, { logout_time: new Date() });
      }
      
      return res.status(200).json({
        success: true,
        message: 'Logout successful. Token cleared.'
      });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = authController;
