module.exports = (sequelize, DataTypes) => {
    const Review = sequelize.define('Review', {
        id: {
            type: DataTypes.BIGINT.UNSIGNED,
            autoIncrement: true,
            primaryKey: true
        },
        reviewer_id: {
            type: DataTypes.BIGINT.UNSIGNED,
            allowNull: false
        },
        target_user_id: {
            type: DataTypes.BIGINT.UNSIGNED,
            allowNull: false
        },
        appointment_id: {
            type: DataTypes.BIGINT.UNSIGNED,
            allowNull: true, // Optional link to specific appointment
        },
        rating: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            validate: { min: 1, max: 5 } // 1-5 star rating
        },
        comment: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        review_type: {
            type: DataTypes.ENUM('service', 'appointment', 'product', 'general'),
            defaultValue: 'general'
        }
    }, {
        tableName: 'reviews',
        underscored: true,
        timestamps: true
    });

    return Review;
};
