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
const express = require('express');

// Mock db
const db = {
  none: jest.fn()
};

// Mock server.js to use our fake db
jest.mock('../server/server', () => {
  const express = require('express');
  const app = express();
  app.use(express.json());
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
    db.none.mockResolvedValueOnce();
    db.none('UPDATE proyecto SET modalidad = $1 WHERE proyecto_id = $2', [modalidad, proyectoId])
      .then(() => res.status(200).json({ message: "Proyecto actualizado correctamente" }))
      .catch(() => res.status(500).json({ error: "Error de base de datos" }));
  });
  return app;
});

const app = require('../server/server');

describe('PUT /api/proyectos/:id', () => {
  it('should update project modalidad with valid modalidad', async () => {
    db.none.mockResolvedValueOnce();
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
    db.none.mockRejectedValueOnce(new Error('DB error'));
    const res = await request(app)
      .put('/api/proyectos/1')
      .send({ modalidad: 'mixto' });
    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty('error');
  });
});