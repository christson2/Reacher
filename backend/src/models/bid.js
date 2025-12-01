module.exports = (sequelize, DataTypes) => {
    const Bid = sequelize.define('Bid', {
        id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
        request_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
        provider_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
        amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
        delivery_time_days: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
        message: { type: DataTypes.TEXT, allowNull: true },
        attachments: { type: DataTypes.JSON, allowNull: true }
    }, {
        tableName: 'bids',
        underscored: true,
        timestamps: true
    });

    return Bid;
};
