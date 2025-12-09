/**
 * PostgreSQL Database Adapter
 * Replaces SQLite for production use on Supabase
 * 
 * Usage:
 * Replace require('./db-sqlite.js') with require('./db-postgres.js')
 * All function signatures remain the same
 */

const { Pool } = require('pg');

let pool = null;

/**
 * Initialize database connection
 */
async function initializeDatabase() {
  try {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false // Required for Supabase
      },
      max: 20, // Maximum pool connections
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000
    });

    // Test connection
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();

    console.log('[Database] Connected to PostgreSQL');
    return Promise.resolve();
  } catch (error) {
    console.error('[Database] Connection failed:', error);
    throw error;
  }
}

/**
 * Create tables (handled by migrations for PostgreSQL)
 * This function is a no-op since schema is managed via Supabase
 */
async function createTables() {
  console.log('[Database] Tables already managed by migrations');
  return Promise.resolve();
}

/**
 * Run a query (INSERT, UPDATE, DELETE)
 */
function runQuery(sql, params = []) {
  return new Promise(async (resolve, reject) => {
    try {
      const result = await pool.query(sql, params);
      resolve({
        lastID: result.rows[0]?.id,
        changes: result.rowCount
      });
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Get a single row
 */
function getOne(sql, params = []) {
  return new Promise(async (resolve, reject) => {
    try {
      const result = await pool.query(sql, params);
      resolve(result.rows[0] || null);
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Get multiple rows
 */
function getAll(sql, params = []) {
  return new Promise(async (resolve, reject) => {
    try {
      const result = await pool.query(sql, params);
      resolve(result.rows || []);
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Close database connection
 */
async function closeDatabase() {
  if (pool) {
    await pool.end();
    console.log('[Database] Connection closed');
  }
}

/**
 * Get connection pool (for advanced usage)
 */
function getPool() {
  return pool;
}

/**
 * Health check
 */
async function healthCheck() {
  try {
    const result = await pool.query('SELECT 1 as health');
    return result.rows[0].health === 1;
  } catch (error) {
    console.error('[Database] Health check failed:', error);
    return false;
  }
}

module.exports = {
  initializeDatabase,
  createTables,
  runQuery,
  getOne,
  getAll,
  closeDatabase,
  getPool,
  healthCheck
};
