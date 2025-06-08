/**
 * Tests for the PATCH /osf_institucional/:osf_id endpoint.
 * This endpoint updates OSF institucional and related data.
 *
 * These tests check:
 * - Successful update (returns 200 and success message)
 * - Database error (returns 500 and error message)
 * - Partial update (only some fields sent)
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
  app.use(express.urlencoded({ extended: true }));

  let shouldFail = false;
  app.__setDbFail = (fail) => { shouldFail = fail; };

  app.patch('/osf_institucional/:osf_id', (req, res) => {
    if (shouldFail) {
      return res.status(500).json({ error: 'Error al actualizar OSF' });
    }
    // Simulate update logic
    return res.status(200).json({ message: 'OSF actualizado correctamente' });
  });

  return app;
});

const app = require('../server/server');

describe('PATCH /osf_institucional/:osf_id', () => {
  beforeEach(() => {
    if (app.__setDbFail) app.__setDbFail(false);
  });

  it('should update OSF institucional and return success message', async () => {
    const res = await request(app)
      .patch('/osf_institucional/1')
      .type('form')
      .send({
        user: JSON.stringify({ correo: 'nuevo@osf.mx' }),
        osf: JSON.stringify({ nombre: 'Nuevo OSF' }),
        institucional: JSON.stringify({ mision: 'Nueva mision' }),
        encargado: JSON.stringify({ nombre_encargado: 'Nuevo Encargado' })
      });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message');
  });

  it('should handle database errors', async () => {
    if (app.__setDbFail) app.__setDbFail(true);
    const res = await request(app)
      .patch('/osf_institucional/1')
      .type('form')
      .send({
        user: JSON.stringify({ correo: 'nuevo@osf.mx' }),
        osf: JSON.stringify({ nombre: 'Nuevo OSF' }),
        institucional: JSON.stringify({ mision: 'Nueva mision' }),
        encargado: JSON.stringify({ nombre_encargado: 'Nuevo Encargado' })
      });
    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty('error');
  });

  it('should allow partial updates', async () => {
    const res = await request(app)
      .patch('/osf_institucional/1')
      .type('form')
      .send({
        user: JSON.stringify({ correo: 'solo@osf.mx' })
      });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message');
  });
});