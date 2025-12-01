const { models } = require('../models');
const Video = models.Video;
const path = require('path');

module.exports = {
    uploadVideo: async (req, res, next) => {
        try {
            if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
            const owner_id = req.user ? req.user.id : req.body.owner_id;
            const video = await Video.create({ owner_id, file_path: req.file.filename, caption: req.body.caption });
            return res.status(201).json({ video });
        } catch (err) { next(err); }
    },

    getVideo: async (req, res, next) => {
        try {
            const id = req.params.id;
            const video = await Video.findOne({ where: { id } });
            if (!video) return res.status(404).json({ error: 'Video not found' });
            // return video metadata; file served statically from uploads
            return res.json({ video });
        } catch (err) { next(err); }
    },

    updateCaption: async (req, res, next) => {
        try {
            const id = req.params.id;
            const video = await Video.findOne({ where: { id } });
            if (!video) return res.status(404).json({ error: 'Video not found' });
            if (req.user && Number(req.user.id) !== Number(video.owner_id)) return res.status(403).json({ error: 'Forbidden' });
            await video.update({ caption: req.body.caption });
            return res.json({ video });
        } catch (err) { next(err); }
    },

    deleteVideo: async (req, res, next) => {
        try {
            const id = req.params.id;
            const video = await Video.findOne({ where: { id } });
            if (!video) return res.status(404).json({ error: 'Video not found' });
            if (req.user && Number(req.user.id) !== Number(video.owner_id)) return res.status(403).json({ error: 'Forbidden' });
            await video.destroy();
            return res.json({ ok: true });
        } catch (err) { next(err); }
    },

    listVideos: async (req, res, next) => {
        try {
            const videos = await Video.findAll({ order: [['created_at', 'DESC']] });
            return res.json({ videos });
        } catch (err) { next(err); }
    }
};
