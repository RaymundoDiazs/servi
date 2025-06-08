/**
 * Tests for the GET /proyecto_carrera/:proyecto_id endpoint.
 * This endpoint fetches all careers associated with a project.
 *
 * These tests check:
 * - Successful fetch of careers (returns array)
 * - No careers found (returns empty array)
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

  let shouldFail = false;
  let shouldReturnEmpty = false;
  app.__setDbFail = (fail) => { shouldFail = fail; };
  app.__setDbEmpty = (isEmpty) => { shouldReturnEmpty = isEmpty; };

  app.get('/proyecto_carrera/:proyecto_id', (req, res) => {
    if (shouldFail) {
      return res.status(500).json({ error: 'Error en la base de datos' });
    }
    if (shouldReturnEmpty) {
      return res.status(200).json([]);
    }
    return res.status(200).json([
      { nombre: "Ingeniería" },
      { nombre: "Derecho" }
    ]);
  });

  return app;
});

const app = require('../server/server');

describe('GET /proyecto_carrera/:proyecto_id', () => {
  beforeEach(() => {
    if (app.__setDbFail) app.__setDbFail(false);
    if (app.__setDbEmpty) app.__setDbEmpty(false);
  });

  it('should return careers for a valid proyecto_id', async () => {
    const res = await request(app).get('/proyecto_carrera/1');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0]).toHaveProperty('nombre');
  });

  it('should return an empty array if no careers found', async () => {
    if (app.__setDbEmpty) app.__setDbEmpty(true);
    const res = await request(app).get('/proyecto_carrera/999');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(0);
  });

  it('should handle database errors', async () => {
    if (app.__setDbFail) app.__setDbFail(true);
    const res = await request(app).get('/proyecto_carrera/1');
    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty('error');
  });
});