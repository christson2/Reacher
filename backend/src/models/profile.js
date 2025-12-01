module.exports = (sequelize, DataTypes) => {
    const Profile = sequelize.define('Profile', {
        id: {
            type: DataTypes.BIGINT.UNSIGNED,
            autoIncrement: true,
            primaryKey: true
        },
        user_id: {
            type: DataTypes.BIGINT.UNSIGNED,
            allowNull: false
        },
        profile_type: {
            type: DataTypes.ENUM('consumer', 'seller', 'provider'),
            allowNull: false,
            defaultValue: 'consumer'
        },
        // Common fields for all profile types
        profile_image: {
            type: DataTypes.STRING(1024),
            allowNull: true
        },
        bio: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        address: {
            type: DataTypes.STRING(500),
            allowNull: true
        },
        phone: {
            type: DataTypes.STRING(50),
            allowNull: true,
        },
        whatsapp_link: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        availability_status: {
            type: DataTypes.ENUM('available', 'busy', 'offline'),
            defaultValue: 'available'
        },

        // Seller-specific fields
        business_name: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        business_category: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        operational_hours: {
            type: DataTypes.JSON,
            allowNull: true // { monday: { start: "09:00", end: "18:00" }, ... }
        },
        product_count: {
            type: DataTypes.INTEGER.UNSIGNED,
            defaultValue: 0,
        },

        // Service Provider-specific fields
        service_name: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        profession_category: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        certification: {
            type: DataTypes.STRING(1024),
            allowNull: true
        },
        experience_years: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: true,
        },
        portfolio_count: {
            type: DataTypes.INTEGER.UNSIGNED,
            defaultValue: 0,
        },

        // Consumer-specific fields
        preferences: {
            type: DataTypes.JSON,
            allowValue: true // Store user preferences like favorite categories, saved vendors
        },

        // Statistics
        total_reviews: {
            type: DataTypes.INTEGER.UNSIGNED,
            defaultValue: 0,
        },
        average_rating: {
            type: DataTypes.DECIMAL(3, 2),
            defaultValue: 0,
        },

        // Profile completion tracking
        is_complete: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        completion_percentage: {
            type: DataTypes.INTEGER.UNSIGNED,
            defaultValue: 0,
        }
    }, {
        tableName: 'profiles',
        underscored: true,
        timestamps: true,
        indexes: [
            { fields: ['user_id'] },
            { fields: ['profile_type'] },
            { fields: ['user_id', 'profile_type'] }
        ]
    });

    return Profile;
};
