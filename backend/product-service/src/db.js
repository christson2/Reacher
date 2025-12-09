const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, '../../db/reacher.sqlite');
let db = null;

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

async function createTables() {
  const productsTable = `
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      seller_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      category TEXT,
      rating REAL DEFAULT 0,
      is_active BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (seller_id) REFERENCES users(id)
    );
  `;

  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run(productsTable, (err) => {
        if (err) reject(err);
      });
      db.run('CREATE INDEX IF NOT EXISTS idx_products_seller_id ON products(seller_id);', (err) => {
        if (err) reject(err);
      });
      db.run('CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);', (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  });
}

function runQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

function getOne(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

function getAll(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
}

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
