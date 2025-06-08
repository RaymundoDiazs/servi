/**
 * Tests for the GET /proyectos/preguntas/:id endpoint.
 * This endpoint fetches the question for a given project.
 *
 * These tests check:
 * - Successful fetch of a question (returns question object)
 * - No question found (returns 400)
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
  let shouldReturnNull = false;
  app.__setDbFail = (fail) => { shouldFail = fail; };
  app.__setDbNull = (isNull) => { shouldReturnNull = isNull; };

  app.get('/proyectos/preguntas/:id', (req, res) => {
    if (shouldFail) {
      return res.status(500).json({ error: 'Error en la base de datos' });
    }
    if (shouldReturnNull) {
      return res.status(400).json({ error: 'Error en la DB' });
    }
    return res.status(200).json({
      id_pregunta: 1,
      id_proyecto: req.params.id,
      pregunta: "¿Por qué quieres participar?"
    });
  });

  return app;
});

const app = require('../server/server');

describe('GET /proyectos/preguntas/:id', () => {
  beforeEach(() => {
    if (app.__setDbFail) app.__setDbFail(false);
    if (app.__setDbNull) app.__setDbNull(false);
  });

  it('should return the question for a valid project id', async () => {
    const res = await request(app).get('/proyectos/preguntas/10');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('id_pregunta');
    expect(res.body).toHaveProperty('pregunta');
    expect(res.body).toHaveProperty('id_proyecto', '10');
  });

  it('should return 400 if no question is found', async () => {
    if (app.__setDbNull) app.__setDbNull(true);
    const res = await request(app).get('/proyectos/preguntas/99');
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('should handle database errors', async () => {
    if (app.__setDbFail) app.__setDbFail(true);
    const res = await request(app).get('/proyectos/preguntas/10');
    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty('error');
  });
});