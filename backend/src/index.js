const express = require('express');
const path = require('path');
require('dotenv').config();

const { sequelize } = require('./models');
const app = require('./app');
const child = require('child_process');

const PORT = process.env.PORT || 4000;

async function start() {
    try {
        await sequelize.authenticate();
        console.log('Database connection OK');

        if (process.env.RUN_MIGRATIONS === 'true') {
            console.log('RUN_MIGRATIONS=true — running sequelize migrations...');
            // run migrations via npx sequelize db:migrate
            child.execSync('npx sequelize db:migrate', { stdio: 'inherit' });
        } else if (process.env.NODE_ENV === 'development') {
            // In development, auto-sync models to create missing tables to ease local testing.
            console.log('NODE_ENV=development — running sequelize.sync() to ensure tables exist');
            await sequelize.sync();
        }

                // Correct absolute path to frontend folder
                const FRONTEND_DIR = path.join(__dirname, "..", "..", "frontend");

                console.log('Index: about to call app.use(express.static)', FRONTEND_DIR);
                // Serve everything inside /frontend (HTML, CSS, JS, images)
                app.use(express.static(FRONTEND_DIR));

                console.log('Index: about to register /pages/:file route');
                // Serve pages manually
                app.get("/pages/:file", (req, res) => {
                    const filePath = path.join(FRONTEND_DIR, "pages", req.params.file);
                    console.log("Serving:", filePath);  // for debugging
                    return res.sendFile(filePath);
                });

                console.log('Index: about to register catch-all route *');
                // If someone opens any random route → load home or index
                // Use `app.use` (no path-to-regexp parsing) to avoid path parsing issues
                app.use((req, res) => {
                    res.sendFile(path.join(FRONTEND_DIR, "pages", "home.html"));
                });

        
        // start server
        console.log('Index: about to call app.listen');
        const server = app.listen(PORT, '0.0.0.0', () => {
            console.log(`FreeMart backend listening on http://0.0.0.0:${PORT}`);
        });

        // Handle server errors
        server.on('error', (err) => {
            console.error('Server error:', err);
            process.exit(1);
        });

        // Handle uncaught exceptions
        process.on('uncaughtException', (err) => {
            console.error('Uncaught exception:', err);
            process.exit(1);
        });

        // Handle unhandled promise rejections
        process.on('unhandledRejection', (err) => {
            console.error('Unhandled rejection:', err);
        });
    } catch (err) {
        console.error('Failed to start server', err);
        process.exit(1);
    }
}

if (require.main === module) start();

module.exports = { start, app };
