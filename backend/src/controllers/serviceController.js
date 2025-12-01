const { models, Sequelize } = require('../models');
const Service = models.Service;
const sequelize = models.sequelize;

function haversineSQL(lat, lon) {
    return `(6371 * acos( least(1.0, cos(radians(${lat})) * cos(radians(latitude)) * cos(radians(longitude) - radians(${lon})) + sin(radians(${lat})) * sin(radians(latitude)) )))`;
}

module.exports = {
    createService: async (req, res, next) => {
        try {
            const payload = req.body;
            if (!payload.provider_id && req.user) payload.provider_id = req.user.id;
            const service = await Service.create(payload);
            return res.status(201).json({ service });
        } catch (err) { next(err); }
    },

    getService: async (req, res, next) => {
        try {
            const id = req.params.id;
            const service = await Service.findOne({ where: { id } });
            if (!service) return res.status(404).json({ error: 'Service not found' });
            return res.json({ service });
        } catch (err) { next(err); }
    },

    updateService: async (req, res, next) => {
        try {
            const id = req.params.id;
            const service = await Service.findOne({ where: { id } });
            if (!service) return res.status(404).json({ error: 'Service not found' });
            if (req.user && Number(req.user.id) !== Number(service.provider_id)) return res.status(403).json({ error: 'Forbidden' });
            await service.update(req.body);
            return res.json({ service });
        } catch (err) { next(err); }
    },

    deleteService: async (req, res, next) => {
        try {
            const id = req.params.id;
            const service = await Service.findOne({ where: { id } });
            if (!service) return res.status(404).json({ error: 'Service not found' });
            if (req.user && Number(req.user.id) !== Number(service.provider_id)) return res.status(403).json({ error: 'Forbidden' });
            await service.destroy();
            return res.json({ ok: true });
        } catch (err) { next(err); }
    },

    searchNearby: async (req, res, next) => {
        try {
            const { lat, lon, radius, q } = req.query;
            if (!(lat && lon)) return res.status(400).json({ error: 'lat and lon required' });
            const maxDist = radius ? Number(radius) : 10;
            const distSQL = haversineSQL(lat, lon);
            const services = await sequelize.query(`SELECT *, ${distSQL} as distance FROM services WHERE ${distSQL} <= :maxDist`, {
                replacements: { maxDist },
                type: Sequelize.QueryTypes.SELECT
            });
            return res.json({ services });
        } catch (err) { next(err); }
    }
};
