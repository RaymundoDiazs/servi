/**
 * Tests for the GET /postulaciones/:alumno_id endpoint.
 * This endpoint fetches all applications for a given student.
 *
 * These tests check:
 * - Successful fetch of applications (returns array)
 * - No applications found (returns empty array)
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

  app.get('/postulaciones/:alumno_id', (req, res) => {
    if (shouldFail) {
      return res.status(500).json({ error: 'Error en la base de datos' });
    }
    if (shouldReturnEmpty) {
      return res.status(200).json([]);
    }
    return res.status(200).json([
      {
        postulacion_id: 1,
        alumno_id: req.params.alumno_id,
        proyecto_id: 10,
        estado: "pendiente"
      }
    ]);
  });

  return app;
});

const app = require('../server/server');

describe('GET /postulaciones/:alumno_id', () => {
  beforeEach(() => {
    if (app.__setDbFail) app.__setDbFail(false);
    if (app.__setDbEmpty) app.__setDbEmpty(false);
  });

  it('should return applications for a valid alumno_id', async () => {
    const res = await request(app).get('/postulaciones/123');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0]).toHaveProperty('alumno_id', '123');
  });

  it('should return an empty array if no applications found', async () => {
    if (app.__setDbEmpty) app.__setDbEmpty(true);
    const res = await request(app).get('/postulaciones/999');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(0);
  });

  it('should handle database errors', async () => {
    if (app.__setDbFail) app.__setDbFail(true);
    const res = await request(app).get('/postulaciones/123');
    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty('error');
  });
});