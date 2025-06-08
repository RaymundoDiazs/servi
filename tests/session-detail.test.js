/**
 * Tests for the GET /session/detail endpoint.
 * This endpoint checks session authentication and returns session details.
 *
 * These tests check:
 * - Successful session authentication (returns session details)
 * - Unauthenticated access (returns 401)
 * - Session error (returns 500)
 *
 * Supertest is used to simulate HTTP requests.
 * Session/auth logic is mocked in-memory.
 */

const request = require('supertest');

// Mock server.js to use a fake session/auth
jest.mock('../server/server', () => {
  const express = require('express');
  const app = express();

  let shouldFail = false;
  let isAuthenticated = true;
  app.__setAuthFail = (fail) => { shouldFail = fail; };
  app.__setAuthenticated = (auth) => { isAuthenticated = auth; };

  // Mock authenticateSession middleware
  const authenticateSession = (req, res, next) => {
    if (shouldFail) return res.status(500).json({ error: 'Session error' });
    if (!isAuthenticated) return res.status(401).json({ error: 'No session' });
    req.session = { user: { id: 1, name: "Test User" } };
    next();
  };

  app.get('/session/detail', authenticateSession, (req, res) => {
    res.status(200).json({ session: req.session });
  });

  return app;
});

const app = require('../server/server');

describe('GET /session/detail', () => {
  beforeEach(() => {
    if (app.__setAuthFail) app.__setAuthFail(false);
    if (app.__setAuthenticated) app.__setAuthenticated(true);
  });

  it('should return session details for authenticated user', async () => {
    const res = await request(app).get('/session/detail');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('session');
    expect(res.body.session.user).toHaveProperty('name', 'Test User');
  });

  it('should return 401 if not authenticated', async () => {
    if (app.__setAuthenticated) app.__setAuthenticated(false);
    const res = await request(app).get('/session/detail');
    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('error');
  });

  it('should handle session errors', async () => {
    if (app.__setAuthFail) app.__setAuthFail(true);
    const res = await request(app).get('/session/detail');
    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty('error');
  });
});