const { models } = require('../models');
const Contact = models.Contact;

module.exports = {
    create: async (req, res, next) => {
        try {
            const payload = req.body;
            if (!payload.user_id && req.user) payload.user_id = req.user.id;
            const contact = await Contact.create(payload);
            return res.status(201).json({ contact });
        } catch (err) { next(err); }
    },

    list: async (req, res, next) => {
        try {
            const userId = req.params.user_id || (req.user && req.user.id);
            const where = {};
            if (userId) where.user_id = userId;
            const contacts = await Contact.findAll({ where, order: [['created_at', 'DESC']] });
            return res.json({ contacts });
        } catch (err) { next(err); }
    },

    get: async (req, res, next) => {
        try {
            const id = req.params.id;
            const contact = await Contact.findOne({ where: { id } });
            if (!contact) return res.status(404).json({ error: 'Contact not found' });
            return res.json({ contact });
        } catch (err) { next(err); }
    },

    remove: async (req, res, next) => {
        try {
            const id = req.params.id;
            const contact = await Contact.findOne({ where: { id } });
            if (!contact) return res.status(404).json({ error: 'Contact not found' });
            await contact.destroy();
            return res.json({ ok: true });
        } catch (err) { next(err); }
    }
};
