module.exports = (sequelize, DataTypes) => {
    const Contact = sequelize.define('Contact', {
        id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
        user_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true },
        name: { type: DataTypes.STRING(255), allowNull: false },
        email: { type: DataTypes.STRING(255), allowNull: true },
        phone: { type: DataTypes.STRING(50), allowNull: true },
        message: { type: DataTypes.TEXT, allowNull: true }
    }, {
        tableName: 'contacts',
        underscored: true,
        timestamps: true
    });

    return Contact;
};
