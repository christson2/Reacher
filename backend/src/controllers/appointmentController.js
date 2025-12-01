const { models } = require('../models');
const Appointment = models.Appointment;
const User = models.User;

module.exports = {
    // Create a new appointment
    createAppointment: async (req, res, next) => {
        try {
            const { service_id, request_id, provider_id, scheduled_time, duration_minutes, location, notes } = req.body;

            if (!provider_id || !scheduled_time) {
                return res.status(400).json({ error: 'Missing required fields: provider_id, scheduled_time' });
            }

            // If not provided by request body, use authenticated user's ID as consumer
            const consumer_id = req.body.consumer_id || (req.user ? req.user.id : null);
            if (!consumer_id) {
                return res.status(401).json({ error: 'Authentication required' });
            }

            // Validate that provider exists
            const provider = await User.findByPk(provider_id);
            if (!provider) {
                return res.status(404).json({ error: 'Provider not found' });
            }

            // Validate scheduled time is in the future
            const scheduledDate = new Date(scheduled_time);
            if (scheduledDate <= new Date()) {
                return res.status(400).json({ error: 'Appointment time must be in the future' });
            }

            const appointment = await Appointment.create({
                service_id,
                request_id,
                consumer_id,
                provider_id,
                scheduled_time: scheduledDate,
                duration_minutes: duration_minutes || 60,
                location,
                notes,
            });

            return res.status(201).json({ appointment });
        } catch (err) {
            next(err);
        }
    },

    // Get appointment by ID
    getAppointment: async (req, res, next) => {
        try {
            const id = req.params.id;
            const appointment = await Appointment.findOne({ where: { id, is_deleted: false } });

            if (!appointment) {
                return res.status(404).json({ error: 'Appointment not found' });
            }

            return res.json({ appointment });
        } catch (err) {
            next(err);
        }
    },

    // Update appointment
    updateAppointment: async (req, res, next) => {
        try {
            const id = req.params.id;
            const appointment = await Appointment.findOne({ where: { id, is_deleted: false } });

            if (!appointment) {
                return res.status(404).json({ error: 'Appointment not found' });
            }

            // Check ownership: only consumer or provider can update
            if (req.user && ![appointment.consumer_id, appointment.provider_id].includes(req.user.id)) {
                return res.status(403).json({ error: 'Forbidden' });
            }

            const payload = req.body;

            // Validate scheduled time if being updated
            if (payload.scheduled_time) {
                const scheduledDate = new Date(payload.scheduled_time);
                if (scheduledDate <= new Date()) {
                    return res.status(400).json({ error: 'Appointment time must be in the future' });
                }
            }

            await appointment.update(payload);
            return res.json({ appointment });
        } catch (err) {
            next(err);
        }
    },

    // Soft delete (cancel) appointment
    deleteAppointment: async (req, res, next) => {
        try {
            const id = req.params.id;
            const appointment = await Appointment.findOne({ where: { id, is_deleted: false } });

            if (!appointment) {
                return res.status(404).json({ error: 'Appointment not found' });
            }

            // Check ownership: only consumer or provider can cancel
            if (req.user && ![appointment.consumer_id, appointment.provider_id].includes(req.user.id)) {
                return res.status(403).json({ error: 'Forbidden' });
            }

            const cancellation_reason = req.body.reason || 'User cancelled';
            await appointment.update({ is_deleted: true, status: 'cancelled', cancellation_reason });

            return res.json({ ok: true, message: 'Appointment cancelled' });
        } catch (err) {
            next(err);
        }
    },

    // List appointments for consumer
    listAppointmentsForConsumer: async (req, res, next) => {
        try {
            const consumer_id = req.params.consumer_id || (req.user ? req.user.id : null);

            if (!consumer_id) {
                return res.status(401).json({ error: 'Authentication required' });
            }

            const { status } = req.query; // optional filter by status
            const where = { consumer_id, is_deleted: false };
            if (status) where.status = status;

            const appointments = await Appointment.findAll({ where });
            return res.json({ appointments });
        } catch (err) {
            next(err);
        }
    },

    // List appointments for provider
    listAppointmentsForProvider: async (req, res, next) => {
        try {
            const provider_id = req.params.provider_id || (req.user ? req.user.id : null);

            if (!provider_id) {
                return res.status(401).json({ error: 'Authentication required' });
            }

            const { status } = req.query; // optional filter by status
            const where = { provider_id, is_deleted: false };
            if (status) where.status = status;

            const appointments = await Appointment.findAll({ where });
            return res.json({ appointments });
        } catch (err) {
            next(err);
        }
    },

    // Get upcoming appointments for a user (consumer or provider)
    getUpcomingAppointments: async (req, res, next) => {
        try {
            const user_id = req.user ? req.user.id : null;

            if (!user_id) {
                return res.status(401).json({ error: 'Authentication required' });
            }

            const now = new Date();
            const appointments = await Appointment.findAll({
                where: {
                    is_deleted: false,
                    scheduled_time: { [require('sequelize').Op.gte]: now },
                    [require('sequelize').Op.or]: [
                        { consumer_id: user_id },
                        { provider_id: user_id }
                    ]
                },
                order: [['scheduled_time', 'ASC']],
            });

            return res.json({ appointments });
        } catch (err) {
            next(err);
        }
    },

    // Get past appointments for a user
    getPastAppointments: async (req, res, next) => {
        try {
            const user_id = req.user ? req.user.id : null;

            if (!user_id) {
                return res.status(401).json({ error: 'Authentication required' });
            }

            const now = new Date();
            const appointments = await Appointment.findAll({
                where: {
                    is_deleted: false,
                    scheduled_time: { [require('sequelize').Op.lt]: now },
                    [require('sequelize').Op.or]: [
                        { consumer_id: user_id },
                        { provider_id: user_id }
                    ]
                },
                order: [['scheduled_time', 'DESC']],
            });

            return res.json({ appointments });
        } catch (err) {
            next(err);
        }
    },

    // Confirm appointment (provider action)
    confirmAppointment: async (req, res, next) => {
        try {
            const id = req.params.id;
            const appointment = await Appointment.findOne({ where: { id, is_deleted: false } });

            if (!appointment) {
                return res.status(404).json({ error: 'Appointment not found' });
            }

            // Only provider can confirm
            if (req.user && req.user.id !== appointment.provider_id) {
                return res.status(403).json({ error: 'Only provider can confirm appointment' });
            }

            await appointment.update({ status: 'confirmed' });
            return res.json({ appointment });
        } catch (err) {
            next(err);
        }
    },

    // Mark appointment as completed
    completeAppointment: async (req, res, next) => {
        try {
            const id = req.params.id;
            const appointment = await Appointment.findOne({ where: { id, is_deleted: false } });

            if (!appointment) {
                return res.status(404).json({ error: 'Appointment not found' });
            }

            // Either consumer or provider can mark as completed
            if (req.user && ![appointment.consumer_id, appointment.provider_id].includes(req.user.id)) {
                return res.status(403).json({ error: 'Forbidden' });
            }

            await appointment.update({ status: 'completed' });
            return res.json({ appointment });
        } catch (err) {
            next(err);
        }
    },
};
