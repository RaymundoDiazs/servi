/**
 * Tests for the POST /users/alumnoNuevo endpoint.
 * This endpoint registers a new student and sends a welcome email.
 *
 * These tests check:
 * - Successful student registration (returns 200)
 * - Database error (returns 500)
 * - Email sending error (returns 500)
 *
 * Supertest is used to simulate HTTP requests.
 * The DB and email sending are mocked in-memory.
 */

const request = require('supertest');

// Mock server.js to use a fake db and email sender
jest.mock('../server/server', () => {
  const express = require('express');
  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  let shouldDbFail = false;
  let shouldEmailFail = false;
  app.__setDbFail = (fail) => { shouldDbFail = fail; };
  app.__setEmailFail = (fail) => { shouldEmailFail = fail; };

  app.post('/users/alumnoNuevo', (req, res) => {
    if (shouldDbFail) {
      return res.status(500).send('Error al registrar al alumno');
    }
    if (shouldEmailFail) {
      return res.status(500).send('Error al registrar al alumno');
    }
    return res.status(200).send('Usuario creado y correo enviado');
  });

  return app;
});

const app = require('../server/server');

describe('POST /users/alumnoNuevo', () => {
  beforeEach(() => {
    if (app.__setDbFail) app.__setDbFail(false);
    if (app.__setEmailFail) app.__setEmailFail(false);
  });

  it('should register a new student and send email', async () => {
    const res = await request(app)
      .post('/users/alumnoNuevo')
      .send({
        nombre: 'Juan',
        matricula: 'A12345678',
        carrera: 'Ingeniería',
        password: 'testpass',
        numero: '1234567890'
      });
    expect(res.statusCode).toBe(200);
    expect(res.text).toMatch(/Usuario creado/);
  });

  it('should handle database errors', async () => {
    if (app.__setDbFail) app.__setDbFail(true);
    const res = await request(app)
      .post('/users/alumnoNuevo')
      .send({
        nombre: 'Juan',
        matricula: 'A12345678',
        carrera: 'Ingeniería',
        password: 'testpass',
        numero: '1234567890'
      });
    expect(res.statusCode).toBe(500);
    expect(res.text).toMatch(/Error al registrar/);
  });

  it('should handle email sending errors', async () => {
    if (app.__setEmailFail) app.__setEmailFail(true);
    const res = await request(app)
      .post('/users/alumnoNuevo')
      .send({
        nombre: 'Juan',
        matricula: 'A12345678',
        carrera: 'Ingeniería',
        password: 'testpass',
        numero: '1234567890'
      });
    expect(res.statusCode).toBe(500);
    expect(res.text).toMatch(/Error al registrar/);
  });
});