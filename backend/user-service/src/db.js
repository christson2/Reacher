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
  // Tables already created by auth-service, just verify
  return Promise.resolve();
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
