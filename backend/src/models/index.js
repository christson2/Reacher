const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');
require('dotenv').config();

let sequelize;

if (process.env.DB_TYPE === 'sqlite' || process.env.NODE_ENV === 'development') {
    // Use SQLite for development.
    // Prefer an explicit DB path (process.env.DB_PATH) otherwise default to
    // the repository root `freemart.db` so migrations and runtime use the
    // same file.
    const defaultDbPath = path.join(__dirname, '..', '..', '..', 'freemart.db');
    const dbPath = process.env.DB_PATH || defaultDbPath;
    sequelize = new Sequelize({
        dialect: 'sqlite',
        storage: dbPath,
        logging: false,
    });
} else {
    // Use MySQL for production
    sequelize = new Sequelize(
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
}

const db = {
    sequelize,
    Sequelize,
    DataTypes,
    models: {},
};

// Import models
db.models.User = require('./user')(sequelize, DataTypes);
db.models.Profile = require('./profile')(sequelize, DataTypes);
db.models.Product = require('./product')(sequelize, DataTypes);
db.models.Service = require('./service')(sequelize, DataTypes);
db.models.Request = require('./request')(sequelize, DataTypes);
db.models.Bid = require('./bid')(sequelize, DataTypes);
db.models.Video = require('./video')(sequelize, DataTypes);
db.models.Review = require('./review')(sequelize, DataTypes);
db.models.Appointment = require('./appointment')(sequelize, DataTypes);
db.models.Post = require('./post')(sequelize, DataTypes);
db.models.Contact = require('./contact')(sequelize, DataTypes);
db.models.Job = require('./job')(sequelize, DataTypes);
db.models.Message = require('./message')(sequelize, DataTypes);
db.models.Favourite = require('./favourite')(sequelize, DataTypes);
db.models.AccountSwitchLog = require('./accountSwitchLog')(sequelize, DataTypes);
db.models.SearchLog = require('./searchLog')(sequelize, DataTypes);

module.exports = db;
