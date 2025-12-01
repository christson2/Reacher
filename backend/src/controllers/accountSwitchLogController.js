const { models } = require('../models');
const AccountSwitchLog = models.AccountSwitchLog;

module.exports = {
    list: async (req, res, next) => {
        try {
            const userId = req.params.user_id || (req.user && req.user.id);
            const where = {};
            if (userId) where.user_id = userId;
            const logs = await AccountSwitchLog.findAll({ where, order: [['created_at','DESC']] });
            return res.json({ logs });
        } catch (err) { next(err); }
    }
};
