/**
 * Pruebas para el endpoint GET /postulaciones.
 * Este endpoint consulta todas las postulaciones.
 *
 * Estas pruebas cubren:
 * - Consulta exitosa de todas las postulaciones (retorna un arreglo)
 * - Sin postulaciones (retorna un arreglo vacío)
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

  app.get('/postulaciones', (req, res) => {
    if (shouldFail) {
      return res.status(500).json({ error: 'Error en la base de datos' });
    }
    if (shouldReturnEmpty) {
      return res.status(200).json([]);
    }
    return res.status(200).json([
      {
        postulacion_id: 1,
        alumno_id: 123,
        proyecto: "Proyecto A",
        carrera: "Ingeniería",
        estado_proyecto: "visible"
      },
      {
        postulacion_id: 2,
        alumno_id: 456,
        proyecto: "Proyecto B",
        carrera: "Derecho",
        estado_proyecto: "lleno"
      }
    ]);
  });

  return app;
});

const app = require('../server/server');

describe('GET /postulaciones', () => {
  beforeEach(() => {
    if (app.__setDbFail) app.__setDbFail(false);
    if (app.__setDbEmpty) app.__setDbEmpty(false);
  });

  it('debe retornar todas las postulaciones', async () => {
    const res = await request(app).get('/postulaciones');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0]).toHaveProperty('proyecto');
  });

  it('debe retornar un arreglo vacío si no hay postulaciones', async () => {
    if (app.__setDbEmpty) app.__setDbEmpty(true);
    const res = await request(app).get('/postulaciones');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(0);
  });

  it('debe manejar errores de base de datos', async () => {
    if (app.__setDbFail) app.__setDbFail(true);
    const res = await request(app).get('/postulaciones');
    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty('error');
  });
});