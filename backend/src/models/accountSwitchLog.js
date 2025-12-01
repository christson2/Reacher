module.exports = (sequelize, DataTypes) => {
    const AccountSwitchLog = sequelize.define('AccountSwitchLog', {
        id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
        user_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
        from_type: { type: DataTypes.STRING(50), allowNull: true },
        to_type: { type: DataTypes.STRING(50), allowNull: true }
    }, {
        tableName: 'account_switch_logs',
        underscored: true,
        timestamps: true
    });

    return AccountSwitchLog;
};
