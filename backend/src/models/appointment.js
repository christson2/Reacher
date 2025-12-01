module.exports = (sequelize, DataTypes) => {
    const Appointment = sequelize.define('Appointment', {
        id: {
            type: DataTypes.BIGINT.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
        },
        service_id: {
            type: DataTypes.BIGINT.UNSIGNED,
            allowNull: true, // optional if appointment is for general request
        },
        request_id: {
            type: DataTypes.BIGINT.UNSIGNED,
            allowNull: true, // optional if appointment is for a specific service
        },
        consumer_id: {
            type: DataTypes.BIGINT.UNSIGNED,
            allowNull: false,
        },
        provider_id: {
            type: DataTypes.BIGINT.UNSIGNED,
            allowNull: false,
        },
        scheduled_time: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        duration_minutes: {
            type: DataTypes.INTEGER.UNSIGNED,
            defaultValue: 60,
        },
        status: {
            type: DataTypes.ENUM('pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'),
            defaultValue: 'pending',
        },
        location: {
            type: DataTypes.STRING(500),
            allowNull: true,
        },
        notes: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        cancellation_reason: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        is_deleted: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        }
    }, {
        tableName: 'appointments',
        underscored: true,
        timestamps: true,
    });

    return Appointment;
};
