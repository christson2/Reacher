module.exports = (sequelize, DataTypes) => {
    const Product = sequelize.define('Product', {
        id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
        title: { type: DataTypes.STRING(255), allowNull: false },
        images: { type: DataTypes.JSON, allowNull: true },
        description: { type: DataTypes.TEXT, allowNull: true },
        category: { type: DataTypes.STRING(255), allowNull: true },
        price: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0.00 },
        seller_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
        stock: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 0 },
        latitude: { type: DataTypes.DECIMAL(10, 7), allowNull: true },
        longitude: { type: DataTypes.DECIMAL(10, 7), allowNull: true }
    }, {
        tableName: 'products',
        underscored: true,
        timestamps: true
    });

    return Product;
};
