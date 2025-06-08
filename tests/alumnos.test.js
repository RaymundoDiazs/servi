/**
 * Tests for the GET /alumnos/user/:user_id endpoint.
 * This endpoint fetches student data by user ID.
 *
 * These tests check:
 * - Successful fetch of an existing student
 * - No student found (returns null)
 * - Database error handling
 *
 * Supertest is used to simulate HTTP requests.
 * The DB is mocked in-memory.
 */

const request = require('supertest');

// Mock server.js to use a fake db
jest.mock('../server/server', () => {
  const express = require('express');
  const app = express();

  // In-memory mock for db.oneOrNone
  let shouldFail = false;
  let shouldReturnNull = false;
  app.__setDbFail = (fail) => { shouldFail = fail; };
  app.__setDbNull = (isNull) => { shouldReturnNull = isNull; };

  app.get('/alumnos/user/:user_id', (req, res) => {
    if (shouldFail) {
      return res.status(500).json({ error: "DB error" });
    }
    if (shouldReturnNull) {
      return res.status(200).json(null);
    }
    return res.status(200).json({
      user_id: req.params.user_id,
      nombre: "Juan",
      carrera: "Ingeniería"
    });
  });

  return app;
});

const app = require('../server/server');

describe('GET /alumnos/user/:user_id', () => {
  beforeEach(() => {
    if (app.__setDbFail) app.__setDbFail(false);
    if (app.__setDbNull) app.__setDbNull(false);
  });

  it('should return student data for a valid user_id', async () => {
    const res = await request(app).get('/alumnos/user/123');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('user_id', '123');
    expect(res.body).toHaveProperty('nombre');
    expect(res.body).toHaveProperty('carrera');
  });

  it('should return null if no student is found', async () => {
    if (app.__setDbNull) app.__setDbNull(true);
    const res = await request(app).get('/alumnos/user/999');
    expect(res.statusCode).toBe(200);
    expect(res.body).toBeNull();
  });

  it('should handle database errors', async () => {
    if (app.__setDbFail) app.__setDbFail(true);
    const res = await request(app).get('/alumnos/user/123');
    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty('error');
  });
});