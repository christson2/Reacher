/**
 * Message Service
 * 
 * Manages messaging between users
 * Endpoints:
 *   GET    /messages              - Get user's conversations
 *   GET    /messages/:user_id     - Get conversation thread
 *   POST   /messages              - Send message
 *   DELETE /messages/:id          - Delete message (sender only)
 */

const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { body, param, query, validationResult } = require('express-validator');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const { initializeDatabase, runQuery, getOne, getAll, closeDatabase } = require('./db');

const app = express();
const PORT = process.env.PORT || 5006;

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
  res.status(200).json({ status: 'ok', service: 'message-service' });
});

/**
 * GET /messages
 * Get user's conversations
 */
app.get(
  '/messages',
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Invalid limit'),
  query('offset').optional().isInt({ min: 0 }).withMessage('Invalid offset'),
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

      // Get conversations where user is involved
      const conversations = await getAll(
        `SELECT 
          CASE 
            WHEN user1_id = ? THEN user2_id 
            ELSE user1_id 
          END as other_user_id,
          last_message_at,
          created_at
        FROM conversations 
        WHERE user1_id = ? OR user2_id = ?
        ORDER BY last_message_at DESC
        LIMIT ? OFFSET ?`,
        [req.userId, req.userId, req.userId, limit, offset]
      );

      // Get last message for each conversation
      const enriched = await Promise.all(
        conversations.map(async (conv) => {
          const lastMsg = await getOne(
            `SELECT content, created_at FROM messages 
             WHERE (sender_id = ? AND recipient_id = ?) OR (sender_id = ? AND recipient_id = ?)
             ORDER BY created_at DESC LIMIT 1`,
            [req.userId, conv.other_user_id, conv.other_user_id, req.userId]
          );

          const unreadCount = await getOne(
            `SELECT COUNT(*) as count FROM messages 
             WHERE recipient_id = ? AND sender_id = ? AND read_status = 0`,
            [req.userId, conv.other_user_id]
          );

          return {
            ...conv,
            last_message: lastMsg?.content || '',
            unread_count: unreadCount?.count || 0
          };
        })
      );

      res.status(200).json({
        success: true,
        data: enriched,
        pagination: { limit, offset }
      });
    } catch (error) {
      console.error('[Message Service] Error getting conversations:', error);
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  }
);

/**
 * GET /messages/:user_id
 * Get conversation thread
 */
app.get(
  '/messages/:user_id',
  param('user_id').isUUID().withMessage('Invalid user ID'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Invalid limit'),
  query('offset').optional().isInt({ min: 0 }).withMessage('Invalid offset'),
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

      const { user_id } = req.params;
      const limit = parseInt(req.query.limit) || 50;
      const offset = parseInt(req.query.offset) || 0;

      // Get messages between users
      const messages = await getAll(
        `SELECT * FROM messages 
         WHERE (sender_id = ? AND recipient_id = ?) OR (sender_id = ? AND recipient_id = ?)
         ORDER BY created_at DESC
         LIMIT ? OFFSET ?`,
        [req.userId, user_id, user_id, req.userId, limit, offset]
      );

      // Mark messages as read
      await runQuery(
        `UPDATE messages SET read_status = 1 
         WHERE recipient_id = ? AND sender_id = ? AND read_status = 0`,
        [req.userId, user_id]
      );

      res.status(200).json({
        success: true,
        data: messages.reverse(),
        pagination: { limit, offset }
      });
    } catch (error) {
      console.error('[Message Service] Error getting thread:', error);
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  }
);

/**
 * POST /messages
 * Send message
 */
app.post(
  '/messages',
  body('recipient_id').isUUID().withMessage('Invalid recipient ID'),
  body('content').notEmpty().isString().trim().isLength({ min: 1, max: 5000 }).withMessage('Invalid content'),
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

      const { recipient_id, content } = req.body;

      if (req.userId === recipient_id) {
        return res.status(400).json({
          success: false,
          message: 'Invalid action',
          error: 'Cannot send message to yourself'
        });
      }

      const messageId = uuidv4();

      // Insert message
      await runQuery(
        `INSERT INTO messages (id, sender_id, recipient_id, content)
         VALUES (?, ?, ?, ?)`,
        [messageId, req.userId, recipient_id, content]
      );

      // Update or create conversation
      const conversation = await getOne(
        `SELECT id FROM conversations 
         WHERE (user1_id = ? AND user2_id = ?) OR (user1_id = ? AND user2_id = ?)`,
        [req.userId, recipient_id, recipient_id, req.userId]
      );

      if (!conversation) {
        const convId = uuidv4();
        const [user1, user2] = [req.userId, recipient_id].sort();
        await runQuery(
          `INSERT INTO conversations (id, user1_id, user2_id) VALUES (?, ?, ?)`,
          [convId, user1, user2]
        );
      } else {
        await runQuery(
          `UPDATE conversations SET last_message_at = CURRENT_TIMESTAMP 
           WHERE id = ?`,
          [conversation.id]
        );
      }

      res.status(201).json({
        success: true,
        message: 'Message sent',
        data: {
          id: messageId,
          sender_id: req.userId,
          recipient_id,
          content,
          created_at: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('[Message Service] Error sending message:', error);
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  }
);

/**
 * DELETE /messages/:id
 * Delete message (sender only)
 */
app.delete(
  '/messages/:id',
  param('id').isUUID().withMessage('Invalid message ID'),
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
      const message = await getOne('SELECT sender_id FROM messages WHERE id = ?', [id]);

      if (!message) {
        return res.status(404).json({
          success: false,
          message: 'Message not found',
          error: 'Message not found'
        });
      }

      if (message.sender_id !== req.userId) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized',
          error: 'You can only delete your own messages'
        });
      }

      await runQuery('DELETE FROM messages WHERE id = ?', [id]);

      res.status(200).json({
        success: true,
        message: 'Message deleted'
      });
    } catch (error) {
      console.error('[Message Service] Error deleting message:', error);
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
  console.error('[Message Service] Error:', err);
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
      console.log(`[Message Service] 🚀 Server running on port ${PORT}`);
      console.log(`[Message Service] Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('[Message Service] Failed to start:', error);
    process.exit(1);
  }
}

/**
 * Graceful shutdown
 */
process.on('SIGINT', async () => {
  console.log('\n[Message Service] Shutting down...');
  await closeDatabase();
  process.exit(0);
});

// Start the service
start();
