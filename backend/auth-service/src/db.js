const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcrypt');

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
  const usersTable = `
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      phone TEXT,
      roles TEXT DEFAULT 'consumer',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const profilesTable = `
    CREATE TABLE IF NOT EXISTS profiles (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL UNIQUE,
      bio TEXT,
      avatar_url TEXT,
      location TEXT,
      rating REAL DEFAULT 0,
      verified BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `;

  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run(usersTable, (err) => {
        if (err) reject(err);
      });
      db.run(profilesTable, (err) => {
        if (err) reject(err);
      });
      db.run('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);', (err) => {
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
 * Hash password
 */
async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

/**
 * Verify password
 */
async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
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
  hashPassword,
  verifyPassword,
  closeDatabase
};
