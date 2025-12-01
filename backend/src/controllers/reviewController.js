const { models } = require('../models');
const Review = models.Review;
const Appointment = models.Appointment;

module.exports = {
    addReview: async (req, res, next) => {
        try {
            const payload = req.body;
            if (!payload.reviewer_id && req.user) payload.reviewer_id = req.user.id;

            // Validate rating
            if (payload.rating && (payload.rating < 1 || payload.rating > 5)) {
                return res.status(400).json({ error: 'Rating must be between 1 and 5' });
            }

            // If appointment_id is provided, validate appointment exists and reviewer is consumer
            if (payload.appointment_id) {
                const appointment = await Appointment.findByPk(payload.appointment_id);
                if (!appointment) {
                    return res.status(404).json({ error: 'Appointment not found' });
                }
                // Only consumer can review after appointment
                if (req.user && req.user.id !== appointment.consumer_id) {
                    return res.status(403).json({ error: 'Only consumer can review this appointment' });
                }
                payload.target_user_id = appointment.provider_id;
                payload.review_type = 'appointment';
            }

            const review = await Review.create(payload);
            return res.status(201).json({ review });
        } catch (err) {
            next(err);
        }
    },

    getReview: async (req, res, next) => {
        try {
            const id = req.params.id;
            const review = await Review.findOne({ where: { id } });
            if (!review) return res.status(404).json({ error: 'Review not found' });
            return res.json({ review });
        } catch (err) {
            next(err);
        }
    },

    updateReview: async (req, res, next) => {
        try {
            const id = req.params.id;
            const review = await Review.findOne({ where: { id } });
            if (!review) return res.status(404).json({ error: 'Review not found' });

            if (req.user && Number(req.user.id) !== Number(review.reviewer_id)) {
                return res.status(403).json({ error: 'Forbidden' });
            }

            // Validate rating if being updated
            if (req.body.rating && (req.body.rating < 1 || req.body.rating > 5)) {
                return res.status(400).json({ error: 'Rating must be between 1 and 5' });
            }

            await review.update(req.body);
            return res.json({ review });
        } catch (err) {
            next(err);
        }
    },

    deleteReview: async (req, res, next) => {
        try {
            const id = req.params.id;
            const review = await Review.findOne({ where: { id } });
            if (!review) return res.status(404).json({ error: 'Review not found' });

            if (req.user && Number(req.user.id) !== Number(review.reviewer_id)) {
                return res.status(403).json({ error: 'Forbidden' });
            }

            await review.destroy();
            return res.json({ ok: true });
        } catch (err) {
            next(err);
        }
    },

    listForUser: async (req, res, next) => {
        try {
            const target_user_id = req.params.user_id;
            const reviews = await Review.findAll({ where: { target_user_id } });
            return res.json({ reviews });
        } catch (err) {
            next(err);
        }
    },

    // Get reviews for a specific appointment
    listForAppointment: async (req, res, next) => {
        try {
            const appointment_id = req.params.appointment_id;
            const reviews = await Review.findAll({ where: { appointment_id } });
            return res.json({ reviews });
        } catch (err) {
            next(err);
        }
    },

    // Get average rating for a user
    getUserRating: async (req, res, next) => {
        try {
            const target_user_id = req.params.user_id;
            const reviews = await Review.findAll({ where: { target_user_id } });

            if (reviews.length === 0) {
                return res.json({ user_id: target_user_id, average_rating: 0, review_count: 0 });
            }

            const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
            const average = (sum / reviews.length).toFixed(2);

            return res.json({
                user_id: target_user_id,
                average_rating: parseFloat(average),
                review_count: reviews.length,
                reviews
            });
        } catch (err) {
            next(err);
        }
    },

    // Get feedback/reviews filtered by type
    listByType: async (req, res, next) => {
        try {
            const { type } = req.params; // 'service', 'appointment', 'product', 'general'
            const where = { review_type: type };

            const reviews = await Review.findAll({ where });
            return res.json({ reviews });
        } catch (err) {
            next(err);
        }
    }
};
