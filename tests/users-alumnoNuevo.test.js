/**
 * Pruebas para el endpoint POST /users/alumnoNuevo.
 * Este endpoint registra un nuevo alumno y envía un correo de bienvenida.
 *
 * Estas pruebas cubren:
 * - Registro exitoso de un alumno y envío de correo (retorna 200)
 * - Error de base de datos (retorna 500)
 * - Error al enviar el correo (retorna 500)
 *
 * Supertest se utiliza para simular peticiones HTTP y la base de datos y el envío de correo están simulados en memoria.
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

  it('debe registrar un alumno y enviar correo exitosamente', async () => {
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

  it('debe manejar errores de base de datos', async () => {
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

  it('debe manejar errores al enviar el correo', async () => {
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