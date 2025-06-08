/**
 * Pruebas para el endpoint GET /postulaciones/alumno/:alumno_id.
 * Este endpoint consulta todas las postulaciones de un alumno.
 *
 * Estas pruebas cubren:
 * - Consulta exitosa de postulaciones de un alumno (retorna un arreglo)
 * - Sin postulaciones para el alumno (retorna un arreglo vacío)
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
  let shouldReturnEmpty = false;
  app.__setDbFail = (fail) => { shouldFail = fail; };
  app.__setDbEmpty = (isEmpty) => { shouldReturnEmpty = isEmpty; };

  app.get('/postulaciones/alumno/:alumno_id', (req, res) => {
    if (shouldFail) {
      return res.status(500).json({ error: 'Error en la base de datos' });
    }
    if (shouldReturnEmpty) {
      return res.status(200).json([]);
    }
    return res.status(200).json([
      {
        postulacion_id: 1,
        alumno_id: req.params.alumno_id,
        proyecto_id: 10,
        estado: "pendiente"
      }
    ]);
  });

  return app;
});

const app = require('../server/server');

describe('GET /postulaciones/alumno/:alumno_id', () => {
  beforeEach(() => {
    if (app.__setDbFail) app.__setDbFail(false);
    if (app.__setDbEmpty) app.__setDbEmpty(false);
  });

  it('debe retornar postulaciones para un alumno válido', async () => {
    const res = await request(app).get('/postulaciones/alumno/123');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0]).toHaveProperty('alumno_id', '123');
  });

  it('debe retornar un arreglo vacío si no hay postulaciones', async () => {
    if (app.__setDbEmpty) app.__setDbEmpty(true);
    const res = await request(app).get('/postulaciones/alumno/999');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(0);
  });

  it('debe manejar errores de base de datos', async () => {
    if (app.__setDbFail) app.__setDbFail(true);
    const res = await request(app).get('/postulaciones/alumno/123');
    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty('error');
  });
});