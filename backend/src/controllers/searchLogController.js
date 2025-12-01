const { models } = require('../models');
const SearchLog = models.SearchLog;

module.exports = {
    list: async (req, res, next) => {
        try {
            const logs = await SearchLog.findAll({ order: [['created_at','DESC']] });
            return res.json({ logs });
        } catch (err) { next(err); }
    },

    create: async (req, res, next) => {
        try {
            const payload = req.body;
            if (!payload.user_id && req.user) payload.user_id = req.user.id;
            const entry = await SearchLog.create(payload);
            return res.status(201).json({ entry });
        } catch (err) { next(err); }
    }
};
