const express = require('express');

const path = require('path');
const cors = require('cors');
require('dotenv').config();

// Debug: log route registrations to help trace path-to-regexp errors
try {
	const Router = require('express').Router;
	const origUse = Router.use;
	Router.use = function(...args) {
		try { console.log('[Router.use] args:', args.map(a => (typeof a === 'string' ? a : (a && a.name) || typeof a)).join(', ')); } catch (e) {}
		return origUse.apply(this, args);
	};
	const methods = ['get','post','put','delete','patch','all'];
	methods.forEach(m => {
		const orig = Router[m];
		Router[m] = function(path) {
			try { console.log(`[Router.${m}]`, path); } catch (e) {}
			return orig.apply(this, arguments);
		};
	});
} catch (e) {
	// ignore if instrumentation fails
}

const routes = require('./routes');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

// Allow cross-origin requests from the frontend during development
app.use(cors({ origin: process.env.FRONTEND_ORIGIN || 'http://localhost:3000' }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend static files
app.use(express.static(path.join(__dirname, '..', '..', 'frontend')));
// Serve uploaded media files
app.use('/uploads', express.static(path.join(__dirname, '..', '..', 'uploads')));

// API routes
app.use('/api', routes);

app.get('/api/ping', (req, res) => res.json({ ok: true, time: Date.now() }));

// Log unmatched static asset requests (helps find broken links)
app.use((req, res, next) => {
	const staticExt = /\.(css|js|png|jpg|jpeg|svg|gif|webp|map|ico)$/i;
	if (req.method === 'GET' && staticExt.test(req.path)) {
		// If we reach here, the static asset was not served by express.static
		console.warn(`[StaticNotFound] ${req.method} ${req.originalUrl}`);
	}
	next();
});

app.use(errorHandler);

module.exports = app;
