const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME || 'freemart_dev',
  process.env.DB_USER || 'freemart_user',
  process.env.DB_PASSWORD || 'changeme',
  {
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: false,
  }
);

module.exports = sequelize;
