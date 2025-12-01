const request = require('supertest');
const { app } = require('../src/index');

describe('Ping', () => {
    test('GET /api/ping returns ok', async () => {
        const res = await request(app).get('/api/ping');
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('ok', true);
    });
});
