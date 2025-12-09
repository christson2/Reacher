/**
 * Product Service
 */

const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { param, body, query, validationResult } = require('express-validator');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const { initializeDatabase, runQuery, getOne, getAll, closeDatabase } = require('./db');

const app = express();
const PORT = process.env.PORT || 5003;

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
  next();
};

app.use(extractUserContext);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'product-service' });
});

app.get(
  '/products',
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('offset').optional().isInt({ min: 0 }),
  query('category').optional().isString(),
  handleValidationErrors,
  async (req, res) => {
    try {
      const limit = parseInt(req.query.limit) || 20;
      const offset = parseInt(req.query.offset) || 0;
      const category = req.query.category;

      let sql = 'SELECT * FROM products WHERE is_active = 1';
      const params = [];

      if (category) {
        sql += ' AND category = ?';
        params.push(category);
      }

      sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
      params.push(limit, offset);

      const products = await getAll(sql, params);

      res.status(200).json({ success: true, data: products, pagination: { limit, offset } });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
  }
);

app.get(
  '/products/:id',
  param('id').isUUID(),
  handleValidationErrors,
  async (req, res) => {
    try {
      const product = await getOne('SELECT * FROM products WHERE id = ? AND is_active = 1', [req.params.id]);
      
      if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }

      res.status(200).json({ success: true, data: product });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
  }
);

app.post(
  '/products',
  body('title').notEmpty().isString().isLength({ min: 2, max: 255 }),
  body('description').optional().isString(),
  body('price').isFloat({ min: 0 }),
  body('category').optional().isString(),
  handleValidationErrors,
  async (req, res) => {
    try {
      if (!req.userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const { title, description, price, category } = req.body;
      const productId = uuidv4();

      await runQuery(
        `INSERT INTO products (id, seller_id, title, description, price, category)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [productId, req.userId, title, description || null, price, category || null]
      );

      res.status(201).json({ success: true, message: 'Product created', data: { id: productId, ...req.body } });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
  }
);

app.put(
  '/products/:id',
  param('id').isUUID(),
  body('title').optional().isString(),
  body('price').optional().isFloat({ min: 0 }),
  handleValidationErrors,
  async (req, res) => {
    try {
      const product = await getOne('SELECT seller_id FROM products WHERE id = ?', [req.params.id]);

      if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }

      if (product.seller_id !== req.userId) {
        return res.status(403).json({ success: false, message: 'Forbidden' });
      }

      const updates = [];
      const values = [];
      if (req.body.title) { updates.push('title = ?'); values.push(req.body.title); }
      if (req.body.price !== undefined) { updates.push('price = ?'); values.push(req.body.price); }
      if (req.body.description !== undefined) { updates.push('description = ?'); values.push(req.body.description); }
      
      if (updates.length > 0) {
        values.push(req.params.id);
        await runQuery(`UPDATE products SET ${updates.join(', ')} WHERE id = ?`, values);
      }

      res.status(200).json({ success: true, message: 'Product updated', data: req.body });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
  }
);

app.delete(
  '/products/:id',
  param('id').isUUID(),
  handleValidationErrors,
  async (req, res) => {
    try {
      const product = await getOne('SELECT seller_id FROM products WHERE id = ?', [req.params.id]);

      if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }

      if (product.seller_id !== req.userId) {
        return res.status(403).json({ success: false, message: 'Forbidden' });
      }

      await runQuery('UPDATE products SET is_active = 0 WHERE id = ?', [req.params.id]);

      res.status(200).json({ success: true, message: 'Product deleted' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
  }
);

app.use((err, req, res, next) => {
  console.error('[Product Service] Error:', err);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

async function start() {
  try {
    await initializeDatabase();
    app.listen(PORT, () => {
      console.log(`[Product Service] 🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('[Product Service] Failed to start:', error);
    process.exit(1);
  }
}

process.on('SIGINT', async () => {
  console.log('\n[Product Service] Shutting down...');
  await closeDatabase();
  process.exit(0);
});

start();
