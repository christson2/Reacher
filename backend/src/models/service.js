module.exports = (sequelize, DataTypes) => {
    const Service = sequelize.define('Service', {
        id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
        name: { type: DataTypes.STRING(255), allowNull: false },
        description: { type: DataTypes.TEXT, allowNull: true },
        provider_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
        pricing_info: { type: DataTypes.JSON, allowNull: true },
        skill_category: { type: DataTypes.STRING(255), allowNull: true },
        latitude: { type: DataTypes.DECIMAL(10, 7), allowNull: true },
        longitude: { type: DataTypes.DECIMAL(10, 7), allowNull: true }
    }, {
        tableName: 'services',
        underscored: true,
        timestamps: true
    });

    return Service;
};
