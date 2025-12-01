module.exports = (sequelize, DataTypes) => {
    const Message = sequelize.define('Message', {
        id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
        conversation_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true },
        sender_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
        receiver_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
        request_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true },
        content: { type: DataTypes.TEXT, allowNull: false },
        is_read: { type: DataTypes.BOOLEAN, defaultValue: false }
    }, {
        tableName: 'messages',
        underscored: true,
        timestamps: true
    });

    return Message;
};
