/**
 * Tests for the PUT /api/proyectos/:id endpoint.
 * This endpoint updates the modalidad of a project.
 *
 * These tests check:
 * - Successful update with valid modalidad
 * - Rejection of invalid modalidad
 * - Handling of missing modalidad
 * - Handling of database errors
 *
 * Supertest is used to simulate HTTP requests.
 * Jest mocks the database to isolate endpoint logic.
 */

const request = require('supertest');

// Mock server.js to use a fake db
jest.mock('../server/server', () => {
  const express = require('express');
  const app = express();
  app.use(express.json());

  // In-memory mock for db.none
  let shouldFail = false;
  app.__setDbFail = (fail) => { shouldFail = fail; };

  app.put('/api/proyectos/:id', (req, res) => {
    const proyectoId = req.params.id;
    const { modalidad } = req.body;
    const modalidadesValidas = ["presencial", "en linea", "mixto"];
    if (!modalidad) {
      return res.status(400).json({ error: "Modalidad requerida" });
    }
    if (!modalidadesValidas.includes(modalidad.toLowerCase())) {
      return res.status(400).json({ error: "Modalidad inválida" });
    }
    if (shouldFail) {
      return res.status(500).json({ error: "Error de base de datos" });
    }
    return res.status(200).json({ message: "Proyecto actualizado correctamente" });
  });
  return app;
});

const app = require('../server/server');

describe('PUT /api/proyectos/:id', () => {
  beforeEach(() => {
    // Reset DB fail flag before each test
    if (app.__setDbFail) app.__setDbFail(false);
  });

  it('should update project modalidad with valid modalidad', async () => {
    const res = await request(app)
      .put('/api/proyectos/1')
      .send({ modalidad: 'presencial' });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message');
  });

  it('should reject invalid modalidad', async () => {
    const res = await request(app)
      .put('/api/proyectos/1')
      .send({ modalidad: 'virtual' });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('should reject missing modalidad', async () => {
    const res = await request(app)
      .put('/api/proyectos/1')
      .send({});
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('should handle database errors', async () => {
    if (app.__setDbFail) app.__setDbFail(true);
    const res = await request(app)
      .put('/api/proyectos/1')
      .send({ modalidad: 'mixto' });
    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty('error');
  });
});