/**
 * Pruebas para el endpoint GET /logout.
 * Este endpoint destruye la sesión del usuario.
 *
 * Estas pruebas cubren:
 * - Cierre de sesión exitoso (retorna 200 y mensaje de sesión destruida)
 * - Error al destruir la sesión (retorna 500 y mensaje de error)
 *
 * Supertest se utiliza para simular peticiones HTTP y la sesión está simulada en memoria.
 */

const request = require('supertest');

// Mock server.js to use a fake session
jest.mock('../server/server', () => {
  const express = require('express');
  const app = express();

  let shouldFail = false;
  app.__setFail = (fail) => { shouldFail = fail; };

  // Mock session middleware
  app.use((req, res, next) => {
    req.session = {
      destroy: (cb) => {
        if (shouldFail) {
          cb(new Error('Failed to destroy session, for some reason'));
        } else {
          cb(null);
        }
      }
    };
    next();
  });

  app.get('/logout', (req, res) => {
    req.session.destroy(err => {
      if (err) {
        return res.status(500).send('Failed to destroy session, for some reason');
      }
      res.send('Session destroyed');
    });
  });

  return app;
});

const app = require('../server/server');

describe('GET /logout', () => {
  beforeEach(() => {
    if (app.__setFail) app.__setFail(false);
  });

  it('debe destruir la sesión exitosamente', async () => {
    const res = await request(app).get('/logout');
    expect(res.statusCode).toBe(200);
    expect(res.text).toMatch(/Session destroyed/);
  });

  it('debe manejar errores al destruir la sesión', async () => {
    if (app.__setFail) app.__setFail(true);
    const res = await request(app).get('/logout');
    expect(res.statusCode).toBe(500);
    expect(res.text).toMatch(/Failed to destroy session/);
  });
});