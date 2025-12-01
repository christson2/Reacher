const { models } = require('../models');
const Profile = models.Profile;
const User = models.User;

module.exports = {
    // Switch to a different profile mode
    switchProfileMode: async (req, res, next) => {
        try {
            const user_id = req.user ? req.user.id : null;
            const { profile_mode } = req.body;

            if (!user_id) {
                return res.status(401).json({ error: 'Authentication required' });
            }

            if (!['consumer', 'seller', 'provider'].includes(profile_mode)) {
                return res.status(400).json({ error: 'Invalid profile mode' });
            }

            // Check if user has completed setup for this profile
            const user = await User.findByPk(user_id);
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            // For seller/provider, user must have set up the profile first
            if (profile_mode === 'seller' && !user.seller_profile_active) {
                return res.status(403).json({ error: 'Seller profile not set up yet. Please complete setup first.' });
            }
            if (profile_mode === 'provider' && !user.provider_profile_active) {
                return res.status(403).json({ error: 'Provider profile not set up yet. Please complete setup first.' });
            }

            // Update current profile mode
            await user.update({ current_profile_mode: profile_mode });

            // Get the profile for this mode
            const profile = await Profile.findOne({
                where: { user_id, profile_type: profile_mode }
            });

            return res.json({
                message: `Switched to ${profile_mode} profile`,
                current_mode: profile_mode,
                profile: profile || null
            });
        } catch (err) {
            next(err);
        }
    },

    // Get current active profile
    getCurrentProfile: async (req, res, next) => {
        try {
            const user_id = req.user ? req.user.id : null;
            if (!user_id) {
                return res.status(401).json({ error: 'Authentication required' });
            }

            const user = await User.findByPk(user_id);
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            const profile = await Profile.findOne({
                where: { user_id, profile_type: user.current_profile_mode }
            });

            if (!profile) {
                return res.status(404).json({ error: 'Profile not found' });
            }

            return res.json({ profile, current_mode: user.current_profile_mode });
        } catch (err) {
            next(err);
        }
    },

    // Get all profiles for a user (consumer, seller, provider)
    getAllUserProfiles: async (req, res, next) => {
        try {
            const user_id = req.user ? req.user.id : null;
            if (!user_id) {
                return res.status(401).json({ error: 'Authentication required' });
            }

            const profiles = await Profile.findAll({
                where: { user_id }
            });

            const user = await User.findByPk(user_id);

            return res.json({
                profiles,
                current_mode: user.current_profile_mode,
                profile_status: {
                    consumer: user.consumer_profile_active,
                    seller: user.seller_profile_active,
                    provider: user.provider_profile_active
                }
            });
        } catch (err) {
            next(err);
        }
    },

    // Initialize seller profile (first-time setup)
    initializeSellerProfile: async (req, res, next) => {
        try {
            const user_id = req.user ? req.user.id : null;
            const { business_name, business_category, operational_hours, bio, profile_image, whatsapp_link } = req.body;

            if (!user_id) {
                return res.status(401).json({ error: 'Authentication required' });
            }

            if (!business_name || !business_category) {
                return res.status(400).json({ error: 'business_name and business_category are required' });
            }

            // Check if seller profile already exists
            let profile = await Profile.findOne({
                where: { user_id, profile_type: 'seller' }
            });

            if (profile) {
                return res.status(409).json({ error: 'Seller profile already initialized' });
            }

            // Create seller profile
            profile = await Profile.create({
                user_id,
                profile_type: 'seller',
                business_name,
                business_category,
                operational_hours: operational_hours || {},
                bio,
                profile_image,
                whatsapp_link,
                is_complete: !!(business_name && business_category),
                completion_percentage: business_name && business_category ? 50 : 0
            });

            // Mark seller profile as active on user account
            await User.update({ seller_profile_active: true }, { where: { id: user_id } });

            return res.status(201).json({
                message: 'Seller profile initialized successfully',
                profile,
                next_steps: ['Complete profile information', 'Add product listings', 'Upload promotional videos']
            });
        } catch (err) {
            next(err);
        }
    },

    // Initialize service provider profile (first-time setup)
    initializeProviderProfile: async (req, res, next) => {
        try {
            const user_id = req.user ? req.user.id : null;
            const { service_name, profession_category, certification, experience_years, bio, profile_image, whatsapp_link } = req.body;

            if (!user_id) {
                return res.status(401).json({ error: 'Authentication required' });
            }

            if (!service_name || !profession_category) {
                return res.status(400).json({ error: 'service_name and profession_category are required' });
            }

            // Check if provider profile already exists
            let profile = await Profile.findOne({
                where: { user_id, profile_type: 'provider' }
            });

            if (profile) {
                return res.status(409).json({ error: 'Provider profile already initialized' });
            }

            // Create provider profile
            profile = await Profile.create({
                user_id,
                profile_type: 'provider',
                service_name,
                profession_category,
                certification,
                experience_years,
                bio,
                profile_image,
                whatsapp_link,
                is_complete: !!(service_name && profession_category),
                completion_percentage: service_name && profession_category ? 50 : 0
            });

            // Mark provider profile as active on user account
            await User.update({ provider_profile_active: true }, { where: { id: user_id } });

            return res.status(201).json({
                message: 'Provider profile initialized successfully',
                profile,
                next_steps: ['Complete certifications', 'Add portfolio', 'Upload service videos']
            });
        } catch (err) {
            next(err);
        }
    },

    // Update profile (for current profile mode)
    updateProfile: async (req, res, next) => {
        try {
            const user_id = req.user ? req.user.id : null;
            if (!user_id) {
                return res.status(401).json({ error: 'Authentication required' });
            }

            const user = await User.findByPk(user_id);
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            const profile = await Profile.findOne({
                where: { user_id, profile_type: user.current_profile_mode }
            });

            if (!profile) {
                return res.status(404).json({ error: 'Profile not found' });
            }

            // Update allowed fields based on profile type
            const updateData = {};
            const commonFields = ['bio', 'profile_image', 'phone', 'whatsapp_link', 'availability_status'];
            const sellerFields = ['business_name', 'business_category', 'operational_hours'];
            const providerFields = ['service_name', 'profession_category', 'certification', 'experience_years'];
            const consumerFields = ['preferences'];

            commonFields.forEach(field => {
                if (req.body[field] !== undefined) updateData[field] = req.body[field];
            });

            if (profile.profile_type === 'seller') {
                sellerFields.forEach(field => {
                    if (req.body[field] !== undefined) updateData[field] = req.body[field];
                });
            } else if (profile.profile_type === 'provider') {
                providerFields.forEach(field => {
                    if (req.body[field] !== undefined) updateData[field] = req.body[field];
                });
            } else if (profile.profile_type === 'consumer') {
                consumerFields.forEach(field => {
                    if (req.body[field] !== undefined) updateData[field] = req.body[field];
                });
            }

            await profile.update(updateData);

            return res.json({ message: 'Profile updated successfully', profile });
        } catch (err) {
            next(err);
        }
    },

    // Get profile by user and type
    getProfileByType: async (req, res, next) => {
        try {
            const { user_id, profile_type } = req.params;

            if (!['consumer', 'seller', 'provider'].includes(profile_type)) {
                return res.status(400).json({ error: 'Invalid profile type' });
            }

            const profile = await Profile.findOne({
                where: { user_id, profile_type }
            });

            if (!profile) {
                return res.status(404).json({ error: `${profile_type} profile not found` });
            }

            return res.json({ profile });
        } catch (err) {
            next(err);
        }
    },

    // Get profiles by type (e.g., all seller profiles)
    getProfilesByType: async (req, res, next) => {
        try {
            const { profile_type } = req.params;

            if (!['consumer', 'seller', 'provider'].includes(profile_type)) {
                return res.status(400).json({ error: 'Invalid profile type' });
            }

            const { limit = 20, offset = 0, category } = req.query;

            const where = { profile_type };
            if (category && profile_type === 'seller') {
                where.business_category = category;
            }
            if (category && profile_type === 'provider') {
                where.profession_category = category;
            }

            const profiles = await Profile.findAll({
                where,
                limit: parseInt(limit),
                offset: parseInt(offset),
                order: [['average_rating', 'DESC']]
            });

            const total = await Profile.count({ where });

            return res.json({
                profiles,
                pagination: { total, limit, offset, pages: Math.ceil(total / limit) }
            });
        } catch (err) {
            next(err);
        }
    },

    // Get nearby sellers/providers
    getNearbyProfiles: async (req, res, next) => {
        try {
            const { profile_type, lat, lon, radius = 10 } = req.query;

            if (!['seller', 'provider'].includes(profile_type)) {
                return res.status(400).json({ error: 'Invalid profile type for nearby search' });
            }

            if (!lat || !lon) {
                return res.status(400).json({ error: 'Latitude and longitude required' });
            }

            // Haversine formula for distance calculation
            const haversineQuery = `
                (6371 * acos(cos(radians(?)) * cos(radians(latitude)) * 
                cos(radians(longitude) - radians(?)) + 
                sin(radians(?)) * sin(radians(latitude)))) AS distance
            `;

            const { Sequelize } = require('sequelize');
            const profiles = await Profile.sequelize.query(`
                SELECT p.*, u.name, u.phone,
                ${haversineQuery}
                FROM profiles p
                JOIN users u ON p.user_id = u.id
                WHERE p.profile_type = ? 
                AND p.is_complete = true
                HAVING distance < ?
                ORDER BY distance ASC
                LIMIT 50
            `, {
                replacements: [lat, lon, lat, profile_type, radius],
                type: Sequelize.QueryTypes.SELECT
            });

            return res.json({ profiles, radius });
        } catch (err) {
            next(err);
        }
    },

    // Get profile completion status
    getProfileCompletionStatus: async (req, res, next) => {
        try {
            const user_id = req.user ? req.user.id : null;
            if (!user_id) {
                return res.status(401).json({ error: 'Authentication required' });
            }

            const profiles = await Profile.findAll({
                where: { user_id },
                attributes: ['profile_type', 'is_complete', 'completion_percentage']
            });

            return res.json({ profiles });
        } catch (err) {
            next(err);
        }
    },

    // Delete profile (for a specific role)
    deleteProfileByType: async (req, res, next) => {
        try {
            const user_id = req.user ? req.user.id : null;
            const { profile_type } = req.params;

            if (!user_id) {
                return res.status(401).json({ error: 'Authentication required' });
            }

            if (profile_type === 'consumer') {
                return res.status(403).json({ error: 'Cannot delete consumer profile' });
            }

            const profile = await Profile.findOne({
                where: { user_id, profile_type }
            });

            if (!profile) {
                return res.status(404).json({ error: 'Profile not found' });
            }

            await profile.destroy();

            // Mark profile as inactive on user account
            const updateData = {};
            updateData[`${profile_type}_profile_active`] = false;
            await User.update(updateData, { where: { id: user_id } });

            return res.json({ message: `${profile_type} profile deleted successfully` });
        } catch (err) {
            next(err);
        }
    }
};
