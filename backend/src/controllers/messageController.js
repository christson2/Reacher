const { models } = require('../models');
const Message = models.Message;

module.exports = {
    list: async (req, res, next) => {
        try {
            const { conversation_id, other_user } = req.query;
            const where = {};
            if (conversation_id) where.conversation_id = conversation_id;
            // if other_user provided, show messages between req.user and other_user
            if (other_user && req.user) {
                where[models.Sequelize.Op.or] = [
                    { sender_id: req.user.id, receiver_id: other_user },
                    { sender_id: other_user, receiver_id: req.user.id }
                ];
            }
            const messages = await Message.findAll({ where, order: [['created_at','ASC']] });
            return res.json({ messages });
        } catch (err) { next(err); }
    },

    get: async (req, res, next) => {
        try {
            const id = req.params.id;
            const msg = await Message.findOne({ where: { id } });
            if (!msg) return res.status(404).json({ error: 'Message not found' });
            return res.json({ message: msg });
        } catch (err) { next(err); }
    },

    create: async (req, res, next) => {
        try {
            const payload = req.body;
            if (!payload.sender_id && req.user) payload.sender_id = req.user.id;
            const message = await Message.create(payload);
            return res.status(201).json({ message });
        } catch (err) { next(err); }
    },

    markRead: async (req, res, next) => {
        try {
            const id = req.params.id;
            const msg = await Message.findOne({ where: { id } });
            if (!msg) return res.status(404).json({ error: 'Message not found' });
            if (req.user && Number(req.user.id) !== Number(msg.receiver_id)) return res.status(403).json({ error: 'Forbidden' });
            await msg.update({ is_read: true });
            return res.json({ ok: true });
        } catch (err) { next(err); }
    }
};
