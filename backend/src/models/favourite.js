module.exports = (sequelize, DataTypes) => {
    const Favourite = sequelize.define('Favourite', {
        id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
        user_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
        item_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
        item_type: { type: DataTypes.STRING(50), allowNull: false }
    }, {
        tableName: 'favourites',
        underscored: true,
        timestamps: true
    });

    return Favourite;
};
