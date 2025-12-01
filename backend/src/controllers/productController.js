const { models, Sequelize } = require('../models');
const Product = models.Product;
const sequelize = models.sequelize;

function haversineDistanceSQL(lat, lon) {
    // approximate Haversine in SQL (distance in km)
    return `(6371 * acos( least(1.0, cos(radians(${lat})) * cos(radians(latitude)) * cos(radians(longitude) - radians(${lon})) + sin(radians(${lat})) * sin(radians(latitude)) )))`;
}

module.exports = {
    createProduct: async (req, res, next) => {
        try {
            const payload = req.body;
            if (!payload.seller_id && req.user) payload.seller_id = req.user.id;
            const product = await Product.create(payload);
            return res.status(201).json({ product });
        } catch (err) { next(err); }
    },

    getProduct: async (req, res, next) => {
        try {
            const id = req.params.id;
            const product = await Product.findOne({ where: { id } });
            if (!product) return res.status(404).json({ error: 'Product not found' });
            return res.json({ product });
        } catch (err) { next(err); }
    },

    updateProduct: async (req, res, next) => {
        try {
            const id = req.params.id;
            const product = await Product.findOne({ where: { id } });
            if (!product) return res.status(404).json({ error: 'Product not found' });
            if (req.user && Number(req.user.id) !== Number(product.seller_id)) return res.status(403).json({ error: 'Forbidden' });
            await product.update(req.body);
            return res.json({ product });
        } catch (err) { next(err); }
    },

    deleteProduct: async (req, res, next) => {
        try {
            const id = req.params.id;
            const product = await Product.findOne({ where: { id } });
            if (!product) return res.status(404).json({ error: 'Product not found' });
            if (req.user && Number(req.user.id) !== Number(product.seller_id)) return res.status(403).json({ error: 'Forbidden' });
            await product.destroy();
            return res.json({ ok: true });
        } catch (err) { next(err); }
    },

    searchProducts: async (req, res, next) => {
        try {
            const { category, q, lat, lon, radius } = req.query;
            const where = {};
            if (category) where.category = category;
            if (q) where.title = { [Sequelize.Op.like]: `%${q}%` };

            if (lat && lon) {
                const distSQL = haversineDistanceSQL(lat, lon);
                const maxDist = radius ? Number(radius) : 10; // km
                const products = await sequelize.query(`SELECT *, ${distSQL} as distance FROM products WHERE ${distSQL} <= :maxDist`, {
                    replacements: { maxDist },
                    type: Sequelize.QueryTypes.SELECT
                });
                return res.json({ products });
            }

            const products = await Product.findAll({ where });
            return res.json({ products });
        } catch (err) { next(err); }
    }
};
