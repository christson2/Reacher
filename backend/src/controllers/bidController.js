const { models } = require('../models');
const Bid = models.Bid;

module.exports = {
    submitBid: async (req, res, next) => {
        try {
            const payload = req.body;
            if (!payload.provider_id && req.user) payload.provider_id = req.user.id;
            const bid = await Bid.create(payload);
            return res.status(201).json({ bid });
        } catch (err) { next(err); }
    },

    getBid: async (req, res, next) => {
        try {
            const id = req.params.id;
            const bid = await Bid.findOne({ where: { id } });
            if (!bid) return res.status(404).json({ error: 'Bid not found' });
            return res.json({ bid });
        } catch (err) { next(err); }
    },

    updateBid: async (req, res, next) => {
        try {
            const id = req.params.id;
            const bid = await Bid.findOne({ where: { id } });
            if (!bid) return res.status(404).json({ error: 'Bid not found' });
            if (req.user && Number(req.user.id) !== Number(bid.provider_id)) return res.status(403).json({ error: 'Forbidden' });
            await bid.update(req.body);
            return res.json({ bid });
        } catch (err) { next(err); }
    },

    deleteBid: async (req, res, next) => {
        try {
            const id = req.params.id;
            const bid = await Bid.findOne({ where: { id } });
            if (!bid) return res.status(404).json({ error: 'Bid not found' });
            if (req.user && Number(req.user.id) !== Number(bid.provider_id)) return res.status(403).json({ error: 'Forbidden' });
            await bid.destroy();
            return res.json({ ok: true });
        } catch (err) { next(err); }
    },

    listByRequest: async (req, res, next) => {
        try {
            const request_id = req.params.request_id;
            const bids = await Bid.findAll({ where: { request_id } });
            return res.json({ bids });
        } catch (err) { next(err); }
    }
};
