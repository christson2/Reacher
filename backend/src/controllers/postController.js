const { models } = require('../models');
const Post = models.Post;

module.exports = {
    list: async (req, res, next) => {
        try {
            const posts = await Post.findAll({ order: [['created_at', 'DESC']] });
            return res.json({ posts });
        } catch (err) { next(err); }
    },

    get: async (req, res, next) => {
        try {
            const id = req.params.id;
            const post = await Post.findOne({ where: { id } });
            if (!post) return res.status(404).json({ error: 'Post not found' });
            return res.json({ post });
        } catch (err) { next(err); }
    },

    create: async (req, res, next) => {
        try {
            const payload = req.body;
            if (!payload.user_id && req.user) payload.user_id = req.user.id;
            const post = await Post.create(payload);
            return res.status(201).json({ post });
        } catch (err) { next(err); }
    },

    update: async (req, res, next) => {
        try {
            const id = req.params.id;
            const post = await Post.findOne({ where: { id } });
            if (!post) return res.status(404).json({ error: 'Post not found' });
            if (req.user && Number(req.user.id) !== Number(post.user_id)) return res.status(403).json({ error: 'Forbidden' });
            await post.update(req.body);
            return res.json({ post });
        } catch (err) { next(err); }
    },

    remove: async (req, res, next) => {
        try {
            const id = req.params.id;
            const post = await Post.findOne({ where: { id } });
            if (!post) return res.status(404).json({ error: 'Post not found' });
            if (req.user && Number(req.user.id) !== Number(post.user_id)) return res.status(403).json({ error: 'Forbidden' });
            await post.destroy();
            return res.json({ ok: true });
        } catch (err) { next(err); }
    }
};
