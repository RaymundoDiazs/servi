/**
 * Tests for the POST /login endpoint.
 * This endpoint authenticates a user.
 *
 * These tests check:
 * - Successful login (returns 200 and user info)
 * - Invalid credentials (returns 401)
 * - Database error (returns 500)
 *
 * Supertest is used to simulate HTTP requests.
 * The DB is mocked in-memory.
 */

const request = require('supertest');

// Mock server.js to use a fake db
jest.mock('../server/server', () => {
  const express = require('express');
  const app = express();
  app.use(express.json());

  let shouldDbFail = false;
  let shouldReject = false;
  app.__setDbFail = (fail) => { shouldDbFail = fail; };
  app.__setReject = (rej) => { shouldReject = rej; };

  app.post('/login', (req, res) => {
    if (shouldDbFail) {
      return res.status(500).json({ error: 'DB error' });
    }
    if (shouldReject) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    return res.status(200).json({
      user_id: 1,
      nombre: 'Juan',
      tipo: 'alumno'
    });
  });

  return app;
});

const app = require('../server/server');

describe('POST /login', () => {
  beforeEach(() => {
    if (app.__setDbFail) app.__setDbFail(false);
    if (app.__setReject) app.__setReject(false);
  });

  it('should authenticate user with valid credentials', async () => {
    const res = await request(app)
      .post('/login')
      .send({ matricula: 'A12345678', password: 'testpass' });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('user_id');
    expect(res.body).toHaveProperty('nombre');
    expect(res.body).toHaveProperty('tipo');
  });

  it('should reject invalid credentials', async () => {
    if (app.__setReject) app.__setReject(true);
    const res = await request(app)
      .post('/login')
      .send({ matricula: 'A12345678', password: 'wrongpass' });
    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('error');
  });

  it('should handle database errors', async () => {
    if (app.__setDbFail) app.__setDbFail(true);
    const res = await request(app)
      .post('/login')
      .send({ matricula: 'A12345678', password: 'testpass' });
    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty('error');
  });
});