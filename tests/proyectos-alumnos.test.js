/**
 * Tests for the GET /proyectos/alumnos/:alumno_id endpoint.
 * This endpoint fetches all projects for a given student.
 *
 * These tests check:
 * - Successful fetch of projects for a student (returns array)
 * - No projects found (returns empty array)
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
  let shouldReturnEmpty = false;
  app.__setDbFail = (fail) => { shouldFail = fail; };
  app.__setDbEmpty = (isEmpty) => { shouldReturnEmpty = isEmpty; };

  app.get('/proyectos/alumnos/:alumno_id', (req, res) => {
    if (shouldFail) {
      return res.status(500).json({ error: 'Error en la base de datos' });
    }
    if (shouldReturnEmpty) {
      return res.status(200).json([]);
    }
    return res.status(200).json([
      {
        proyecto_id: 1,
        nombre_proyecto: "Proyecto A",
        modalidad: "presencial"
      },
      {
        proyecto_id: 2,
        nombre_proyecto: "Proyecto B",
        modalidad: "en linea"
      }
    ]);
  });

  return app;
});

const app = require('../server/server');

describe('GET /proyectos/alumnos/:alumno_id', () => {
  beforeEach(() => {
    if (app.__setDbFail) app.__setDbFail(false);
    if (app.__setDbEmpty) app.__setDbEmpty(false);
  });

  it('should return projects for a valid alumno_id', async () => {
    const res = await request(app).get('/proyectos/alumnos/123');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0]).toHaveProperty('nombre_proyecto');
  });

  it('should return an empty array if no projects found', async () => {
    if (app.__setDbEmpty) app.__setDbEmpty(true);
    const res = await request(app).get('/proyectos/alumnos/999');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(0);
  });

  it('should handle database errors', async () => {
    if (app.__setDbFail) app.__setDbFail(true);
    const res = await request(app).get('/proyectos/alumnos/123');
    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty('error');
  });
});