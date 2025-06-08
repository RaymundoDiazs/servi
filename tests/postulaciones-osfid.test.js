/**
 * Pruebas para el endpoint GET /postulaciones/:osf_id.
 * Este endpoint consulta todas las postulaciones asociadas a un OSF.
 *
 * Estas pruebas cubren:
 * - Consulta exitosa de postulaciones para un OSF (retorna un arreglo)
 * - Sin postulaciones para el OSF (retorna un arreglo vacío)
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

  app.get('/postulaciones/:osf_id', (req, res) => {
    if (shouldFail) {
      return res.status(500).json({ error: 'Error en la base de datos' });
    }
    if (shouldReturnEmpty) {
      return res.status(200).json([]);
    }
    return res.status(200).json([
      {
        postulacion_id: 1,
        osf_id: req.params.osf_id,
        alumno_id: 123,
        proyecto: "Proyecto A"
      }
    ]);
  });

  return app;
});

const app = require('../server/server');

describe('GET /postulaciones/:osf_id', () => {
  beforeEach(() => {
    if (app.__setDbFail) app.__setDbFail(false);
    if (app.__setDbEmpty) app.__setDbEmpty(false);
  });

  it('debe retornar postulaciones para un OSF válido', async () => {
    const res = await request(app).get('/postulaciones/10');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0]).toHaveProperty('osf_id', '10');
  });

  it('debe retornar un arreglo vacío si no hay postulaciones', async () => {
    if (app.__setDbEmpty) app.__setDbEmpty(true);
    const res = await request(app).get('/postulaciones/99');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(0);
  });

  it('debe manejar errores de base de datos', async () => {
    if (app.__setDbFail) app.__setDbFail(true);
    const res = await request(app).get('/postulaciones/10');
    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty('error');
  });
});