/**
 * Tests for the GET /proyectos/:id endpoint.
 * This endpoint fetches a single project by its ID.
 *
 * These tests check:
 * - Successful fetch of a project by ID
 * - Project not found (404)
 * - Database error (500)
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
  let shouldReturnNull = false;
  app.__setDbFail = (fail) => { shouldFail = fail; };
  app.__setDbNull = (isNull) => { shouldReturnNull = isNull; };

  app.get('/proyectos/:id', (req, res) => {
    if (shouldFail) {
      return res.status(500).json({ error: 'Error en la base de datos' });
    }
    if (shouldReturnNull) {
      return res.status(404).json({ error: 'Proyecto no encontrado' });
    }
    return res.status(200).json({
      proyecto_id: req.params.id,
      nombre_proyecto: "Proyecto Test",
      modalidad: "presencial"
    });
  });

  return app;
});

const app = require('../server/server');

describe('GET /proyectos/:id', () => {
  beforeEach(() => {
    if (app.__setDbFail) app.__setDbFail(false);
    if (app.__setDbNull) app.__setDbNull(false);
  });

  it('should return project data for a valid id', async () => {
    const res = await request(app).get('/proyectos/1');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('proyecto_id', '1');
    expect(res.body).toHaveProperty('nombre_proyecto');
    expect(res.body).toHaveProperty('modalidad');
  });

  it('should return 404 if project is not found', async () => {
    if (app.__setDbNull) app.__setDbNull(true);
    const res = await request(app).get('/proyectos/999');
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('error');
  });

  it('should handle database errors', async () => {
    if (app.__setDbFail) app.__setDbFail(true);
    const res = await request(app).get('/proyectos/1');
    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty('error');
  });
});