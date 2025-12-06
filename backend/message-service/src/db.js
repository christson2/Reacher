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
  const messagesTable = `
    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      sender_id TEXT NOT NULL,
      recipient_id TEXT NOT NULL,
      content TEXT NOT NULL,
      read_status BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (sender_id) REFERENCES users(id),
      FOREIGN KEY (recipient_id) REFERENCES users(id)
    );
  `;

  const conversationsTable = `
    CREATE TABLE IF NOT EXISTS conversations (
      id TEXT PRIMARY KEY,
      user1_id TEXT NOT NULL,
      user2_id TEXT NOT NULL,
      last_message_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user1_id, user2_id),
      FOREIGN KEY (user1_id) REFERENCES users(id),
      FOREIGN KEY (user2_id) REFERENCES users(id)
    );
  `;

  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run(messagesTable, (err) => {
        if (err) reject(err);
      });
      db.run(conversationsTable, (err) => {
        if (err) reject(err);
      });
      db.run('CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);', (err) => {
        if (err) reject(err);
      });
      db.run('CREATE INDEX IF NOT EXISTS idx_messages_recipient_id ON messages(recipient_id);', (err) => {
        if (err) reject(err);
      });
      db.run('CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);', (err) => {
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
