module.exports = (sequelize, DataTypes) => {
    const SearchLog = sequelize.define('SearchLog', {
        id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
        user_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true },
        query_text: { type: DataTypes.STRING(500), allowNull: false },
        search_type: { type: DataTypes.STRING(50), allowNull: true },
        location: { type: DataTypes.STRING(255), allowNull: true },
        results_count: { type: DataTypes.INTEGER.UNSIGNED, defaultValue: 0 }
    }, {
        tableName: 'search_logs',
        underscored: true,
        timestamps: true
    });

    return SearchLog;
};
