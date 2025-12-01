module.exports = (sequelize, DataTypes) => {
    const Post = sequelize.define('Post', {
        id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
        user_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
        caption: { type: DataTypes.TEXT, allowNull: true },
        image_url: { type: DataTypes.STRING(500), allowNull: true },
        category: { type: DataTypes.STRING(50), allowNull: false, defaultValue: 'general' },
        location: { type: DataTypes.STRING(255), allowNull: true }
    }, {
        tableName: 'posts',
        underscored: true,
        timestamps: true
    });

    return Post;
};
