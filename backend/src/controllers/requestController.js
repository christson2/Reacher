const { models, Sequelize } = require('../models');
const Request = models.Request;
const sequelize = models.sequelize;

function haversineSQL(lat, lon) {
    return `(6371 * acos( least(1.0, cos(radians(${lat})) * cos(radians(latitude)) * cos(radians(longitude) - radians(${lon})) + sin(radians(${lat})) * sin(radians(latitude)) )))`;
}

module.exports = {
    createRequest: async (req, res, next) => {
        try {
            const payload = { ...req.body };
            if (!payload.user_id && req.user) payload.user_id = req.user.id;
            // handle uploaded media files if present
            if (req.files && req.files.length) {
                const media = req.files.map(f => `/uploads/${f.filename}`);
                payload.media = media;
            }
            const request = await Request.create(payload);
            return res.status(201).json({ request });
        } catch (err) { next(err); }
    },

    getRequest: async (req, res, next) => {
        try {
            const id = req.params.id;
            const request = await Request.findOne({ where: { id } });
            if (!request) return res.status(404).json({ error: 'Request not found' });
            return res.json({ request });
        } catch (err) { next(err); }
    },

    updateRequest: async (req, res, next) => {
        try {
            const id = req.params.id;
            const request = await Request.findOne({ where: { id } });
            if (!request) return res.status(404).json({ error: 'Request not found' });
            if (req.user && Number(req.user.id) !== Number(request.user_id)) return res.status(403).json({ error: 'Forbidden' });
            const payload = { ...req.body };
            if (req.files && req.files.length) {
                const media = req.files.map(f => `/uploads/${f.filename}`);
                payload.media = media;
            }
            await request.update(payload);
            return res.json({ request });
        } catch (err) { next(err); }
    },

    deleteRequest: async (req, res, next) => {
        try {
            const id = req.params.id;
            const request = await Request.findOne({ where: { id } });
            if (!request) return res.status(404).json({ error: 'Request not found' });
            if (req.user && Number(req.user.id) !== Number(request.user_id)) return res.status(403).json({ error: 'Forbidden' });
            await request.destroy();
            return res.json({ ok: true });
        } catch (err) { next(err); }
    },

    listNearby: async (req, res, next) => {
        try {
            const { lat, lon, radius, category } = req.query;
            if (!(lat && lon)) return res.status(400).json({ error: 'lat and lon required' });
            const maxDist = radius ? Number(radius) : 10;
            const distSQL = haversineSQL(lat, lon);
            let sql = `SELECT *, ${distSQL} as distance FROM requests WHERE ${distSQL} <= :maxDist`;
            if (category) sql += ` AND category = ${sequelize.escape(category)}`;
            const rows = await sequelize.query(sql, { replacements: { maxDist }, type: Sequelize.QueryTypes.SELECT });
            return res.json({ requests: rows });
        } catch (err) { next(err); }
    }
};
