/**
 * User Service
 * Manages user profiles
 */

const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { param, body, query, validationResult } = require('express-validator');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const { initializeDatabase, runQuery, getOne, getAll, closeDatabase } = require('./db');

const app = express();
const PORT = process.env.PORT || 5002;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

const extractUserContext = (req, res, next) => {
  req.userId = req.headers['x-user-id'];
  req.userEmail = req.headers['x-user-email'];
  next();
};

app.use(extractUserContext);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'user-service' });
});

app.get(
  '/users/:id',
  param('id').isUUID().withMessage('Invalid user ID'),
  handleValidationErrors,
  async (req, res) => {
    try {
      const { id } = req.params;
      const user = await getOne('SELECT id, email, name, created_at FROM users WHERE id = ?', [id]);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const profile = await getOne('SELECT * FROM profiles WHERE user_id = ?', [id]);

      res.status(200).json({
        success: true,
        data: { ...user, profile }
      });
    } catch (error) {
      console.error('[User Service] Error:', error);
      res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
  }
);

app.get(
  '/users',
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('offset').optional().isInt({ min: 0 }),
  handleValidationErrors,
  async (req, res) => {
    try {
      const limit = parseInt(req.query.limit) || 20;
      const offset = parseInt(req.query.offset) || 0;

      const users = await getAll(
        'SELECT id, email, name, created_at FROM users LIMIT ? OFFSET ?',
        [limit, offset]
      );

      res.status(200).json({ success: true, data: users, pagination: { limit, offset } });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
  }
);

app.post(
  '/users',
  body('bio').optional().isString().isLength({ max: 1000 }),
  body('location').optional().isString().isLength({ max: 100 }),
  handleValidationErrors,
  async (req, res) => {
    try {
      if (!req.userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const { bio, location } = req.body;
      await runQuery(
        'UPDATE profiles SET bio = ?, location = ? WHERE user_id = ?',
        [bio || null, location || null, req.userId]
      );

      res.status(201).json({ success: true, message: 'Profile created', data: { bio, location } });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
  }
);

app.put(
  '/users/:id',
  param('id').isUUID(),
  body('bio').optional().isString().isLength({ max: 1000 }),
  body('location').optional().isString().isLength({ max: 100 }),
  handleValidationErrors,
  async (req, res) => {
    try {
      const { id } = req.params;

      if (!req.userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      if (id !== req.userId) {
        return res.status(403).json({ success: false, message: 'Forbidden' });
      }

      const { bio, location } = req.body;
      await runQuery(
        'UPDATE profiles SET bio = ?, location = ? WHERE user_id = ?',
        [bio || null, location || null, id]
      );

      res.status(200).json({ success: true, message: 'Profile updated', data: { bio, location } });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
  }
);

app.delete(
  '/users/:id',
  param('id').isUUID(),
  handleValidationErrors,
  async (req, res) => {
    try {
      const { id } = req.params;

      if (!req.userId || id !== req.userId) {
        return res.status(403).json({ success: false, message: 'Forbidden' });
      }

      await runQuery('DELETE FROM profiles WHERE user_id = ?', [id]);
      await runQuery('DELETE FROM users WHERE id = ?', [id]);

      res.status(200).json({ success: true, message: 'User deleted' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
  }
);

app.use((err, req, res, next) => {
  console.error('[User Service] Error:', err);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

async function start() {
  try {
    await initializeDatabase();
    app.listen(PORT, () => {
      console.log(`[User Service] 🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('[User Service] Failed to start:', error);
    process.exit(1);
  }
}

process.on('SIGINT', async () => {
  console.log('\n[User Service] Shutting down...');
  await closeDatabase();
  process.exit(0);
});

start();
