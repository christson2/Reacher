/**
 * Trust Service
 * 
 * Manages trust ratings, reviews, and trust scores for users
 * Endpoints:
 *   GET    /trust/:user_id       - Get user's trust score and reviews
 *   POST   /trust/:user_id       - Create review/rating for user
 *   PUT    /trust/review/:id     - Update own review
 *   DELETE /trust/review/:id     - Delete own review
 */

const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { body, param, validationResult } = require('express-validator');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const { initializeDatabase, runQuery, getOne, getAll, closeDatabase } = require('./db');

const app = express();
const PORT = process.env.PORT || 5005;

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
  res.status(200).json({ status: 'ok', service: 'trust-service' });
});

/**
 * GET /trust/:user_id
 * Get user's trust score and reviews
 */
app.get(
  '/trust/:user_id',
  param('user_id').isUUID().withMessage('Invalid user ID'),
  handleValidationErrors,
  async (req, res) => {
    try {
      const { user_id } = req.params;

      // Get reviews
      const reviews = await getAll(
        `SELECT id, reviewer_id, rating, comment, created_at 
         FROM reviews WHERE reviewed_user_id = ? ORDER BY created_at DESC`,
        [user_id]
      );

      // Calculate average rating
      const avgResult = await getOne(
        'SELECT AVG(rating) as avg_rating, COUNT(*) as count FROM reviews WHERE reviewed_user_id = ?',
        [user_id]
      );

      res.status(200).json({
        success: true,
        data: {
          user_id,
          average_rating: avgResult.avg_rating || 0,
          review_count: avgResult.count || 0,
          reviews
        }
      });
    } catch (error) {
      console.error('[Trust Service] Error getting trust score:', error);
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  }
);

/**
 * POST /trust/:user_id
 * Create review/rating (authenticated users only)
 */
app.post(
  '/trust/:user_id',
  param('user_id').isUUID().withMessage('Invalid user ID'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be 1-5'),
  body('comment').optional().isString().trim().isLength({ max: 500 }).withMessage('Comment too long'),
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
      const { rating, comment } = req.body;

      // Cannot review yourself
      if (req.userId === user_id) {
        return res.status(400).json({
          success: false,
          message: 'Invalid action',
          error: 'You cannot review yourself'
        });
      }

      // Check if already reviewed
      const existing = await getOne(
        'SELECT id FROM reviews WHERE reviewer_id = ? AND reviewed_user_id = ?',
        [req.userId, user_id]
      );

      if (existing) {
        return res.status(409).json({
          success: false,
          message: 'Conflict',
          error: 'You have already reviewed this user'
        });
      }

      const reviewId = uuidv4();
      await runQuery(
        `INSERT INTO reviews (id, reviewer_id, reviewed_user_id, rating, comment)
         VALUES (?, ?, ?, ?, ?)`,
        [reviewId, req.userId, user_id, rating, comment || null]
      );

      res.status(201).json({
        success: true,
        message: 'Review created',
        data: {
          id: reviewId,
          reviewer_id: req.userId,
          reviewed_user_id: user_id,
          rating,
          comment
        }
      });
    } catch (error) {
      console.error('[Trust Service] Error creating review:', error);
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  }
);

/**
 * PUT /trust/review/:id
 * Update own review
 */
app.put(
  '/trust/review/:id',
  param('id').isUUID().withMessage('Invalid review ID'),
  body('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be 1-5'),
  body('comment').optional().isString().trim().isLength({ max: 500 }).withMessage('Comment too long'),
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
      const review = await getOne('SELECT reviewer_id FROM reviews WHERE id = ?', [id]);

      if (!review) {
        return res.status(404).json({
          success: false,
          message: 'Review not found',
          error: 'Review not found'
        });
      }

      if (review.reviewer_id !== req.userId) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized',
          error: 'You can only update your own reviews'
        });
      }

      // Build update
      const updates = [];
      const values = [];

      if (req.body.rating !== undefined) {
        updates.push('rating = ?');
        values.push(req.body.rating);
      }
      if (req.body.comment !== undefined) {
        updates.push('comment = ?');
        values.push(req.body.comment);
      }

      if (updates.length > 0) {
        updates.push('updated_at = CURRENT_TIMESTAMP');
        values.push(id);

        const sql = `UPDATE reviews SET ${updates.join(', ')} WHERE id = ?`;
        await runQuery(sql, values);
      }

      res.status(200).json({
        success: true,
        message: 'Review updated',
        data: { id, ...req.body }
      });
    } catch (error) {
      console.error('[Trust Service] Error updating review:', error);
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  }
);

/**
 * DELETE /trust/review/:id
 * Delete own review
 */
app.delete(
  '/trust/review/:id',
  param('id').isUUID().withMessage('Invalid review ID'),
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
      const review = await getOne('SELECT reviewer_id FROM reviews WHERE id = ?', [id]);

      if (!review) {
        return res.status(404).json({
          success: false,
          message: 'Review not found',
          error: 'Review not found'
        });
      }

      if (review.reviewer_id !== req.userId) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized',
          error: 'You can only delete your own reviews'
        });
      }

      await runQuery('DELETE FROM reviews WHERE id = ?', [id]);

      res.status(200).json({
        success: true,
        message: 'Review deleted'
      });
    } catch (error) {
      console.error('[Trust Service] Error deleting review:', error);
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
  console.error('[Trust Service] Error:', err);
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
      console.log(`[Trust Service] 🚀 Server running on port ${PORT}`);
      console.log(`[Trust Service] Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('[Trust Service] Failed to start:', error);
    process.exit(1);
  }
}

/**
 * Graceful shutdown
 */
process.on('SIGINT', async () => {
  console.log('\n[Trust Service] Shutting down...');
  await closeDatabase();
  process.exit(0);
});

// Start the service
start();
