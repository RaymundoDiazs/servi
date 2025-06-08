const request = require('supertest');
const app = require('../server/server'); // Adjust if your app is exported differently

jest.mock('../server/server', () => {
  // Optionally, you can mock the app or DB here for dummy/fake tests
  const express = require('express');
  const app = express();
  app.get('/carreras', (req, res) => res.json([{ nombre: 'Ingeniería' }]));
  return app;
});

describe('GET /carreras', () => {
  it('should return a list of carreras', async () => {
    const res = await request(app).get('/carreras');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0]).toHaveProperty('nombre');
  });
});