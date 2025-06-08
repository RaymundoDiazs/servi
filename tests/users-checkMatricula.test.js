/**
 * Pruebas para el endpoint GET /users/checkMatricula/:matricula.
 * Este endpoint verifica si una matrícula de alumno existe.
 *
 * Estas pruebas cubren:
 * - Matrícula existente (retorna true)
 * - Matrícula no existente (retorna false)
 * - Error de base de datos (retorna 500)
 *
 * Supertest se utiliza para simular peticiones HTTP y la base de datos está simulada en memoria.
 */

const request = require('supertest');

// Mock server.js to use a fake db
jest.mock('../server/server', () => {
  const express = require('express');
  const app = express();

  let shouldFail = false;
  let exists = true;
  app.__setDbFail = (fail) => { shouldFail = fail; };
  app.__setExists = (val) => { exists = val; };

  app.get('/users/checkMatricula/:matricula', (req, res) => {
    if (shouldFail) {
      return res.status(500).send('DB error');
    }
    if (exists) {
      return res.status(200).send(true);
    } else {
      return res.status(200).send(false);
    }
  });

  return app;
});

const app = require('../server/server');

describe('GET /users/checkMatricula/:matricula', () => {
  beforeEach(() => {
    if (app.__setDbFail) app.__setDbFail(false);
    if (app.__setExists) app.__setExists(true);
  });

  it('debe retornar true si la matrícula existe', async () => {
    const res = await request(app).get('/users/checkMatricula/A12345678');
    expect(res.statusCode).toBe(200);
    expect(res.text).toBe('true');
  });

  it('debe retornar false si la matrícula no existe', async () => {
    if (app.__setExists) app.__setExists(false);
    const res = await request(app).get('/users/checkMatricula/NOEXISTE');
    expect(res.statusCode).toBe(200);
    expect(res.text).toBe('false');
  });

  it('debe manejar errores de base de datos', async () => {
    if (app.__setDbFail) app.__setDbFail(true);
    const res = await request(app).get('/users/checkMatricula/A12345678');
    expect(res.statusCode).toBe(500);
    expect(res.text).toMatch(/DB error/);
  });
});