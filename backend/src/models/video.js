module.exports = (sequelize, DataTypes) => {
    const Video = sequelize.define('Video', {
        id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
        owner_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
        file_path: { type: DataTypes.STRING(1024), allowNull: false },
        caption: { type: DataTypes.STRING(1024), allowNull: true }
    }, {
        tableName: 'videos',
        underscored: true,
        timestamps: true
    });

    return Video;
};
