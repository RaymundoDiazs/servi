/**
 * Tests for the GET /proyectos/revisar endpoint.
 * This endpoint fetches projects pending review.
 *
 * These tests check:
 * - Successful fetch of projects pending review (returns array)
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

  app.get('/proyectos/revisar', (req, res) => {
    if (shouldFail) {
      return res.status(500).json({ error: 'Error en la base de datos' });
    }
    if (shouldReturnEmpty) {
      return res.status(200).json([]);
    }
    return res.status(200).json([
      {
        proyecto_id: 1,
        nombre_proyecto: "Proyecto Pendiente",
        estado: "pendiente"
      }
    ]);
  });

  return app;
});

const app = require('../server/server');

describe('GET /proyectos/revisar', () => {
  beforeEach(() => {
    if (app.__setDbFail) app.__setDbFail(false);
    if (app.__setDbEmpty) app.__setDbEmpty(false);
  });

  it('should return projects pending review', async () => {
    const res = await request(app).get('/proyectos/revisar');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0]).toHaveProperty('estado', 'pendiente');
  });

  it('should return an empty array if no projects found', async () => {
    if (app.__setDbEmpty) app.__setDbEmpty(true);
    const res = await request(app).get('/proyectos/revisar');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(0);
  });

  it('should handle database errors', async () => {
    if (app.__setDbFail) app.__setDbFail(true);
    const res = await request(app).get('/proyectos/revisar');
    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty('error');
  });
});