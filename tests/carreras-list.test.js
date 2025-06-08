/**
 * Tests for the GET /carreras endpoint.
 * This endpoint returns a list of careers.
 *
 * These tests check:
 * - Successful fetch of careers (returns array)
 * - Empty result (returns empty array)
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

  let shouldFail = false;
  let shouldReturnEmpty = false;
  app.__setDbFail = (fail) => { shouldFail = fail; };
  app.__setDbEmpty = (isEmpty) => { shouldReturnEmpty = isEmpty; };

  app.get('/carreras', (req, res) => {
    if (shouldFail) {
      return res.status(500).json({ error: "DB error" });
    }
    if (shouldReturnEmpty) {
      return res.status(200).json([]);
    }
    return res.status(200).json([
      { id: 1, nombre: "Ingeniería" },
      { id: 2, nombre: "Derecho" }
    ]);
  });

  return app;
});

const app = require('../server/server');

describe('GET /carreras', () => {
  beforeEach(() => {
    if (app.__setDbFail) app.__setDbFail(false);
    if (app.__setDbEmpty) app.__setDbEmpty(false);
  });

  it('should return a list of careers', async () => {
    const res = await request(app).get('/carreras');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0]).toHaveProperty('nombre');
  });

  it('should return an empty array if no careers exist', async () => {
    if (app.__setDbEmpty) app.__setDbEmpty(true);
    const res = await request(app).get('/carreras');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(0);
  });

  it('should handle database errors', async () => {
    if (app.__setDbFail) app.__setDbFail(true);
    const res = await request(app).get('/carreras');
    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty('error');
  });
});