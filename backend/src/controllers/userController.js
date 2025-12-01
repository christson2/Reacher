const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { models } = require('../models');
const User = models.User;

const jwtSecret = process.env.JWT_SECRET || 'change_this_jwt_secret';

module.exports = {
    signup: async (req, res, next) => {
        try {
            const { name, phone, password, address, latitude, longitude } = req.body;
            if (!phone || !password || !name) return res.status(400).json({ error: 'Missing required fields' });
            const existing = await User.findOne({ where: { phone } });
            if (existing) return res.status(409).json({ error: 'Phone already registered' });
            const hash = await bcrypt.hash(password, 10);
            const payload = { name, phone, password_hash: hash, address, latitude, longitude };
            // If an avatar was uploaded by multer, store its public path
            if (req.file && req.file.filename) {
                payload.profile_picture = `/uploads/${req.file.filename}`;
            }
            const user = await User.create(payload);
            const token = jwt.sign({ id: user.id, phone: user.phone }, jwtSecret, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
            return res.status(201).json({ user: user.get({ plain: true }), token });
        } catch (err) { next(err); }
    },

    login: async (req, res, next) => {
        try {
            const { phone, password } = req.body;
            if (!phone || !password) return res.status(400).json({ error: 'Missing phone or password' });
            const user = await User.scope(null).findOne({ where: { phone } });
            if (!user) return res.status(401).json({ error: 'Invalid credentials' });
            const ok = await bcrypt.compare(password, user.password_hash || '');
            if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
            const token = jwt.sign({ id: user.id, phone: user.phone }, jwtSecret, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
            return res.json({ user: user.get({ plain: true }), token });
        } catch (err) { next(err); }
    },

    getUser: async (req, res, next) => {
        try {
            const id = req.params.id;
            const user = await User.findOne({ where: { id, is_deleted: false } });
            if (!user) return res.status(404).json({ error: 'User not found' });
            return res.json({ user });
        } catch (err) { next(err); }
    },

    updateUser: async (req, res, next) => {
        try {
            const id = req.params.id;
            // allow only owner or admin (simple check: owner)
            if (req.user && req.user.id !== Number(id)) return res.status(403).json({ error: 'Forbidden' });
            const payload = { ...req.body };
            if (payload.password) {
                payload.password_hash = await bcrypt.hash(payload.password, 10);
                delete payload.password;
            }
            await User.update(payload, { where: { id } });
            const updated = await User.findOne({ where: { id } });
            return res.json({ user: updated });
        } catch (err) { next(err); }
    },

    deleteUser: async (req, res, next) => {
        try {
            const id = req.params.id;
            if (req.user && req.user.id !== Number(id)) return res.status(403).json({ error: 'Forbidden' });
            await User.update({ is_deleted: true }, { where: { id } });
            return res.json({ ok: true });
        } catch (err) { next(err); }
    },

    listUsers: async (req, res, next) => {
        try {
            const users = await User.findAll({ where: { is_deleted: false } });
            return res.json({ users });
        } catch (err) { next(err); }
    }
};
