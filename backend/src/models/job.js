module.exports = (sequelize, DataTypes) => {
    const Job = sequelize.define('Job', {
        id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
        user_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
        title: { type: DataTypes.STRING(255), allowNull: false },
        company_name: { type: DataTypes.STRING(255), allowNull: true },
        job_type: { type: DataTypes.STRING(50), allowNull: true },
        description: { type: DataTypes.TEXT, allowNull: true },
        salary_range: { type: DataTypes.STRING(100), allowNull: true },
        location: { type: DataTypes.STRING(255), allowNull: true },
        contact_phone: { type: DataTypes.STRING(50), allowNull: true },
        contact_whatsapp: { type: DataTypes.STRING(50), allowNull: true }
    }, {
        tableName: 'jobs',
        underscored: true,
        timestamps: true
    });

    return Job;
};
