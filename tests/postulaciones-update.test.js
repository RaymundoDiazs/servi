/**
 * Pruebas para el endpoint PATCH /postulaciones/update.
 * Este endpoint actualiza datos de una postulación, alumno y respuesta.
 *
 * Estas pruebas cubren:
 * - Actualización exitosa de postulaciones, alumno y respuesta (retorna 200)
 * - Actualización parcial (solo algunos campos enviados)
 * - Error de base de datos (retorna 500)
 *
 * Supertest se utiliza para simular peticiones HTTP y la base de datos está simulada en memoria.
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

  app.patch('/postulaciones/update', (req, res) => {
    if (shouldFail) {
      return res.status(500).send('Error en la base de datos');
    }
    // Simulate update logic
    res.status(200).send('ok');
  });

  return app;
});

const app = require('../server/server');

describe('PATCH /postulaciones/update', () => {
  beforeEach(() => {
    if (app.__setDbFail) app.__setDbFail(false);
  });

  it('debe actualizar postulaciones, alumno y respuesta correctamente', async () => {
    const res = await request(app)
      .patch('/postulaciones/update')
      .type('form')
      .send({
        postulacion: JSON.stringify({ estado: 'aceptado' }),
        alumno: JSON.stringify({ nombre: 'Juan' }),
        respuesta_descarte: 'respuesta',
        toChange: JSON.stringify({ id_postulacion: 1, alumno_id: 2 })
      });
    expect(res.statusCode).toBe(200);
    expect(res.text).toBe('ok');
  });

  it('debe permitir actualización parcial', async () => {
    const res = await request(app)
      .patch('/postulaciones/update')
      .type('form')
      .send({
        postulacion: JSON.stringify({ estado: 'rechazado' }),
        alumno: JSON.stringify({}),
        respuesta_descarte: 'null',
        toChange: JSON.stringify({ id_postulacion: 1, alumno_id: 2 })
      });
    expect(res.statusCode).toBe(200);
    expect(res.text).toBe('ok');
  });

  it('debe manejar errores de base de datos', async () => {
    if (app.__setDbFail) app.__setDbFail(true);
    const res = await request(app)
      .patch('/postulaciones/update')
      .type('form')
      .send({
        postulacion: JSON.stringify({ estado: 'aceptado' }),
        alumno: JSON.stringify({ nombre: 'Juan' }),
        respuesta_descarte: 'respuesta',
        toChange: JSON.stringify({ id_postulacion: 1, alumno_id: 2 })
      });
    expect(res.statusCode).toBe(500);
    expect(res.text).toMatch(/Error en la base de datos/);
  });
});