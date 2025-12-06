const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, '../../db/reacher.sqlite');
let db = null;

/**
 * Initialize database connection
 */
async function initializeDatabase() {
  return new Promise((resolve, reject) => {
    db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) reject(err);
      else {
        createTables().then(resolve).catch(reject);
      }
    });
  });
}

/**
 * Create tables if they don't exist
 */
async function createTables() {
  const reviewsTable = `
    CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY,
      reviewer_id TEXT NOT NULL,
      reviewed_user_id TEXT NOT NULL,
      rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
      comment TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(reviewer_id, reviewed_user_id),
      FOREIGN KEY (reviewer_id) REFERENCES users(id),
      FOREIGN KEY (reviewed_user_id) REFERENCES users(id)
    );
  `;

  const trustScoresTable = `
    CREATE TABLE IF NOT EXISTS trust_scores (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL UNIQUE,
      average_rating REAL DEFAULT 0,
      total_reviews INTEGER DEFAULT 0,
      completion_rate REAL DEFAULT 0,
      response_time_avg INTEGER DEFAULT 0,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `;

  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run(reviewsTable, (err) => {
        if (err) reject(err);
      });
      db.run(trustScoresTable, (err) => {
        if (err) reject(err);
      });
      db.run('CREATE INDEX IF NOT EXISTS idx_reviews_reviewed_user_id ON reviews(reviewed_user_id);', (err) => {
        if (err) reject(err);
      });
      db.run('CREATE INDEX IF NOT EXISTS idx_reviews_reviewer_id ON reviews(reviewer_id);', (err) => {
        if (err) reject(err);
      });
      db.run('CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at);', (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  });
}

/**
 * Run a query (INSERT, UPDATE, DELETE)
 */
function runQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

/**
 * Get a single row
 */
function getOne(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

/**
 * Get multiple rows
 */
function getAll(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
}

/**
 * Close database connection
 */
async function closeDatabase() {
  return new Promise((resolve, reject) => {
    if (db) {
      db.close((err) => {
        if (err) reject(err);
        else resolve();
      });
    } else {
      resolve();
    }
  });
}

module.exports = {
  initializeDatabase,
  createTables,
  runQuery,
  getOne,
  getAll,
  closeDatabase
};
