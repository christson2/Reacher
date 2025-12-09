/**
 * Auth Service
 * 
 * Manages user authentication and JWT tokens
 * Endpoints:
 *   POST   /auth/signup    - Register new user
 *   POST   /auth/login     - Authenticate user and issue JWT
 *   POST   /auth/verify    - Verify JWT token
 */

const express = require('express');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { body, validationResult } = require('express-validator');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const { initializeDatabase, runQuery, getOne, hashPassword, verifyPassword, closeDatabase } = require('./db');

const app = express();
const PORT = process.env.PORT || 5001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRY = '24h';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * Middleware: Validation error handler
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(e => ({ field: e.param, message: e.msg }))
    });
  }
  next();
};

/**
 * HEALTH CHECK
 */
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'auth-service' });
});

/**
 * POST /auth/signup
 * Register new user
 */
app.post(
  '/auth/signup',
  body('email').isEmail().withMessage('Invalid email'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('name').notEmpty().isString().trim().isLength({ min: 2, max: 100 }).withMessage('Invalid name'),
  body('phone').optional().isMobilePhone().withMessage('Invalid phone'),
  handleValidationErrors,
  async (req, res) => {
    try {
      const { email, password, name, phone } = req.body;

      // Check if user exists
      const existingUser = await getOne('SELECT id FROM users WHERE email = ?', [email]);
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'User already exists',
          error: 'Email already registered'
        });
      }

      // Hash password
      const passwordHash = await hashPassword(password);

      // Create user
      const userId = uuidv4();
      await runQuery(
        `INSERT INTO users (id, email, password_hash, name, phone)
         VALUES (?, ?, ?, ?, ?)`,
        [userId, email, passwordHash, name, phone || null]
      );

      // Auto-create profile
      const profileId = uuidv4();
      await runQuery(
        `INSERT INTO profiles (id, user_id) VALUES (?, ?)`,
        [profileId, userId]
      );

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user_id: userId,
          email,
          name
        }
      });
    } catch (error) {
      console.error('[Auth Service] Error signing up:', error);
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  }
);

/**
 * POST /auth/login
 * Authenticate user
 */
app.post(
  '/auth/login',
  body('email').isEmail().withMessage('Invalid email'),
  body('password').notEmpty().withMessage('Password required'),
  handleValidationErrors,
  async (req, res) => {
    try {
      const { email, password } = req.body;

      // Get user
      const user = await getOne('SELECT * FROM users WHERE email = ?', [email]);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication failed',
          error: 'Invalid credentials'
        });
      }

      // Verify password
      const passwordValid = await verifyPassword(password, user.password_hash);
      if (!passwordValid) {
        return res.status(401).json({
          success: false,
          message: 'Authentication failed',
          error: 'Invalid credentials'
        });
      }

      // Generate JWT
      const token = jwt.sign(
        { user_id: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRY }
      );

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          user_id: user.id,
          email: user.email,
          name: user.name,
          token
        }
      });
    } catch (error) {
      console.error('[Auth Service] Error logging in:', error);
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  }
);

/**
 * POST /auth/verify
 * Verify JWT token
 */
app.post(
  '/auth/verify',
  body('token').notEmpty().withMessage('Token required'),
  handleValidationErrors,
  async (req, res) => {
    try {
      const { token } = req.body;

      jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
          return res.status(401).json({
            success: false,
            message: 'Invalid token',
            error: err.message
          });
        }

        res.status(200).json({
          success: true,
          message: 'Token valid',
          data: decoded
        });
      });
    } catch (error) {
      console.error('[Auth Service] Error verifying token:', error);
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  }
);

/**
 * Error handler
 */
app.use((err, req, res, next) => {
  console.error('[Auth Service] Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Unknown error'
  });
});

/**
 * Start server
 */
async function start() {
  try {
    await initializeDatabase();
    
    app.listen(PORT, () => {
      console.log(`[Auth Service] 🚀 Server running on port ${PORT}`);
      console.log(`[Auth Service] Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('[Auth Service] Failed to start:', error);
    process.exit(1);
  }
}

/**
 * Graceful shutdown
 */
process.on('SIGINT', async () => {
  console.log('\n[Auth Service] Shutting down...');
  await closeDatabase();
  process.exit(0);
});

// Start the service
start();
