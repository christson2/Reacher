/**
 * Notification Service
 * 
 * Manages user notifications
 * Endpoints:
 *   GET    /notifications          - Get user's notifications
 *   POST   /notifications          - Create notification (internal use)
 *   PUT    /notifications/:id      - Mark notification as read
 *   DELETE /notifications/:id      - Delete notification
 */

const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { body, param, query, validationResult } = require('express-validator');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const { initializeDatabase, runQuery, getOne, getAll, closeDatabase } = require('./db');

const app = express();
const PORT = process.env.PORT || 5007;

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
 * Middleware: Extract user context
 */
const extractUserContext = (req, res, next) => {
  req.userId = req.headers['x-user-id'];
  req.userEmail = req.headers['x-user-email'];
  next();
};

app.use(extractUserContext);

/**
 * HEALTH CHECK
 */
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'notification-service' });
});

/**
 * GET /notifications
 * Get user's notifications
 */
app.get(
  '/notifications',
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Invalid limit'),
  query('offset').optional().isInt({ min: 0 }).withMessage('Invalid offset'),
  query('read_status').optional().isBoolean().withMessage('Invalid read_status'),
  handleValidationErrors,
  async (req, res) => {
    try {
      if (!req.userId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized',
          error: 'Authentication required'
        });
      }

      const limit = parseInt(req.query.limit) || 20;
      const offset = parseInt(req.query.offset) || 0;
      const readStatus = req.query.read_status !== undefined 
        ? req.query.read_status === 'true' 
        : undefined;

      let query_sql = 'SELECT * FROM notifications WHERE user_id = ?';
      const params = [req.userId];

      if (readStatus !== undefined) {
        query_sql += ' AND read_status = ?';
        params.push(readStatus ? 1 : 0);
      }

      query_sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
      params.push(limit, offset);

      const notifications = await getAll(query_sql, params);

      // Get total count
      let count_sql = 'SELECT COUNT(*) as count FROM notifications WHERE user_id = ?';
      const count_params = [req.userId];

      if (readStatus !== undefined) {
        count_sql += ' AND read_status = ?';
        count_params.push(readStatus ? 1 : 0);
      }

      const countResult = await getOne(count_sql, count_params);

      res.status(200).json({
        success: true,
        data: notifications,
        pagination: {
          limit,
          offset,
          total: countResult.count
        }
      });
    } catch (error) {
      console.error('[Notification Service] Error getting notifications:', error);
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  }
);

/**
 * POST /notifications
 * Create notification (internal use - no auth required for service-to-service)
 */
app.post(
  '/notifications',
  body('user_id').isUUID().withMessage('Invalid user ID'),
  body('type').notEmpty().isString().trim().isLength({ min: 1, max: 50 }).withMessage('Invalid type'),
  body('title').notEmpty().isString().trim().isLength({ min: 1, max: 255 }).withMessage('Invalid title'),
  body('message').optional().isString().trim().isLength({ max: 5000 }).withMessage('Invalid message'),
  body('link').optional().isString().trim().isLength({ max: 500 }).withMessage('Invalid link'),
  handleValidationErrors,
  async (req, res) => {
    try {
      const { user_id, type, title, message, link } = req.body;

      const notificationId = uuidv4();
      await runQuery(
        `INSERT INTO notifications (id, user_id, type, title, message, link)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [notificationId, user_id, type, title, message || null, link || null]
      );

      res.status(201).json({
        success: true,
        message: 'Notification created',
        data: {
          id: notificationId,
          user_id,
          type,
          title,
          message,
          link
        }
      });
    } catch (error) {
      console.error('[Notification Service] Error creating notification:', error);
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  }
);

/**
 * PUT /notifications/:id
 * Mark notification as read
 */
app.put(
  '/notifications/:id',
  param('id').isUUID().withMessage('Invalid notification ID'),
  handleValidationErrors,
  async (req, res) => {
    try {
      const { id } = req.params;

      if (!req.userId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized',
          error: 'Authentication required'
        });
      }

      // Check ownership
      const notification = await getOne(
        'SELECT user_id FROM notifications WHERE id = ?',
        [id]
      );

      if (!notification) {
        return res.status(404).json({
          success: false,
          message: 'Notification not found',
          error: 'Notification not found'
        });
      }

      if (notification.user_id !== req.userId) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized',
          error: 'You can only mark your own notifications as read'
        });
      }

      await runQuery(
        'UPDATE notifications SET read_status = 1 WHERE id = ?',
        [id]
      );

      res.status(200).json({
        success: true,
        message: 'Notification marked as read',
        data: { id, read_status: true }
      });
    } catch (error) {
      console.error('[Notification Service] Error updating notification:', error);
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  }
);

/**
 * DELETE /notifications/:id
 * Delete notification
 */
app.delete(
  '/notifications/:id',
  param('id').isUUID().withMessage('Invalid notification ID'),
  handleValidationErrors,
  async (req, res) => {
    try {
      const { id } = req.params;

      if (!req.userId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized',
          error: 'Authentication required'
        });
      }

      // Check ownership
      const notification = await getOne(
        'SELECT user_id FROM notifications WHERE id = ?',
        [id]
      );

      if (!notification) {
        return res.status(404).json({
          success: false,
          message: 'Notification not found',
          error: 'Notification not found'
        });
      }

      if (notification.user_id !== req.userId) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized',
          error: 'You can only delete your own notifications'
        });
      }

      await runQuery('DELETE FROM notifications WHERE id = ?', [id]);

      res.status(200).json({
        success: true,
        message: 'Notification deleted'
      });
    } catch (error) {
      console.error('[Notification Service] Error deleting notification:', error);
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
  console.error('[Notification Service] Error:', err);
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
      console.log(`[Notification Service] 🚀 Server running on port ${PORT}`);
      console.log(`[Notification Service] Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('[Notification Service] Failed to start:', error);
    process.exit(1);
  }
}

/**
 * Graceful shutdown
 */
process.on('SIGINT', async () => {
  console.log('\n[Notification Service] Shutting down...');
  await closeDatabase();
  process.exit(0);
});

// Start the service
start();
