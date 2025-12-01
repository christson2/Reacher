module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
        id: {
            type: DataTypes.BIGINT.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING(255),
            allowNull: true,
            unique: true,
        },
        phone: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: true,
        },
        password_hash: {
            type: DataTypes.STRING(255),
        },
        address: {
            type: DataTypes.STRING(500),
        },
        latitude: {
            type: DataTypes.DECIMAL(10, 7),
            allowNull: true,
        },
        longitude: {
            type: DataTypes.DECIMAL(10, 7),
            allowNull: true,
        },
        profile_picture: {
            type: DataTypes.STRING(1024),
            allowNull: true,
        },
        // Role-based system: user always has 3 profiles, tracks which one is active
        current_profile_mode: {
            type: DataTypes.ENUM('consumer', 'seller', 'provider'),
            defaultValue: 'consumer',
        },
        // Tracks if user has completed setup for each profile type
        consumer_profile_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true, // Automatically active on signup
        },
        seller_profile_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        provider_profile_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        // Preferences and metadata
        notification_settings: {
            type: DataTypes.JSON,
            defaultValue: {
                email_notifications: true,
                sms_notifications: true,
                push_notifications: true,
            },
        },
        is_deleted: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        }
    }, {
        tableName: 'users',
        underscored: true,
        timestamps: true,
        defaultScope: {
            attributes: { exclude: ['password_hash'] }
        }
    });

    return User;
};
