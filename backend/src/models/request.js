module.exports = (sequelize, DataTypes) => {
    const Request = sequelize.define('Request', {
        id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
        title: { type: DataTypes.STRING(255), allowNull: false },
        description: { type: DataTypes.TEXT, allowNull: true },
        media: { type: DataTypes.JSON, allowNull: true },
        ai_summary: { type: DataTypes.TEXT, allowNull: true },
        category: { type: DataTypes.STRING(255), allowNull: true },
        user_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
        status: { type: DataTypes.ENUM('open', 'closed', 'cancelled'), defaultValue: 'open' },
        latitude: { type: DataTypes.DECIMAL(10, 7), allowNull: true },
        longitude: { type: DataTypes.DECIMAL(10, 7), allowNull: true }
    }, {
        tableName: 'requests',
        underscored: true,
        timestamps: true
    });

    return Request;
};
