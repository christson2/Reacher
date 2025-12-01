const { models } = require('../models');
const Favourite = models.Favourite;

module.exports = {
    list: async (req, res, next) => {
        try {
            const userId = req.user && req.user.id;
            const where = {};
            if (userId) where.user_id = userId;
            const favs = await Favourite.findAll({ where, order: [['created_at','DESC']] });
            return res.json({ favourites: favs });
        } catch (err) { next(err); }
    },

    create: async (req, res, next) => {
        try {
            const payload = req.body;
            if (!payload.user_id && req.user) payload.user_id = req.user.id;
            const existing = await Favourite.findOne({ where: { user_id: payload.user_id, item_id: payload.item_id, item_type: payload.item_type } });
            if (existing) return res.status(200).json({ favourite: existing });
            const fav = await Favourite.create(payload);
            return res.status(201).json({ favourite: fav });
        } catch (err) { next(err); }
    },

    remove: async (req, res, next) => {
        try {
            const id = req.params.id;
            const fav = await Favourite.findOne({ where: { id } });
            if (!fav) return res.status(404).json({ error: 'Favourite not found' });
            if (req.user && Number(req.user.id) !== Number(fav.user_id)) return res.status(403).json({ error: 'Forbidden' });
            await fav.destroy();
            return res.json({ ok: true });
        } catch (err) { next(err); }
    }
};
