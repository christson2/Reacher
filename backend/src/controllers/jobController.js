const { models } = require('../models');
const Job = models.Job;

module.exports = {
    list: async (req, res, next) => {
        try {
            const jobs = await Job.findAll({ order: [['created_at', 'DESC']] });
            return res.json({ jobs });
        } catch (err) { next(err); }
    },
    get: async (req, res, next) => {
        try {
            const id = req.params.id;
            const job = await Job.findOne({ where: { id } });
            if (!job) return res.status(404).json({ error: 'Job not found' });
            return res.json({ job });
        } catch (err) { next(err); }
    },
    create: async (req, res, next) => {
        try {
            const payload = req.body;
            if (!payload.user_id && req.user) payload.user_id = req.user.id;
            const job = await Job.create(payload);
            return res.status(201).json({ job });
        } catch (err) { next(err); }
    },
    update: async (req, res, next) => {
        try {
            const id = req.params.id;
            const job = await Job.findOne({ where: { id } });
            if (!job) return res.status(404).json({ error: 'Job not found' });
            if (req.user && Number(req.user.id) !== Number(job.user_id)) return res.status(403).json({ error: 'Forbidden' });
            await job.update(req.body);
            return res.json({ job });
        } catch (err) { next(err); }
    },
    remove: async (req, res, next) => {
        try {
            const id = req.params.id;
            const job = await Job.findOne({ where: { id } });
            if (!job) return res.status(404).json({ error: 'Job not found' });
            if (req.user && Number(req.user.id) !== Number(job.user_id)) return res.status(403).json({ error: 'Forbidden' });
            await job.destroy();
            return res.json({ ok: true });
        } catch (err) { next(err); }
    }
};
