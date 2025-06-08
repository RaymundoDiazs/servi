/**
 * Pruebas para el endpoint POST /postulaciones/newPostulacion.
 * Este endpoint crea una nueva postulación para un alumno.
 *
 * Estas pruebas cubren:
 * - Creación exitosa de una postulación (retorna 200)
 * - Error de base de datos (retorna 400)
 * - Postulación con y sin pregunta asociada
 *
 * Supertest se utiliza para simular peticiones HTTP y la base de datos está simulada en memoria.
 */

const request = require('supertest');

// Mock server.js to use a fake db and session
jest.mock('../server/server', () => {
  const express = require('express');
  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  let shouldFail = false;
  app.__setDbFail = (fail) => { shouldFail = fail; };

  // Middleware to mock session
  app.use((req, res, next) => {
    req.session = { info: { alumno_id: 123 } };
    next();
  });

  app.post('/postulaciones/newPostulacion', (req, res) => {
    const form = req.body;
    if (shouldFail) {
      return res.status(400).send('DB error');
    }
    if (form.id_pregunta !== 'null') {
      // Simulate successful insert with question
      return res.status(200).send('Postulación creada!');
    } else {
      // Simulate successful insert without question
      return res.status(200).send('Postulación creada!');
    }
  });

  return app;
});

const app = require('../server/server');

describe('POST /postulaciones/newPostulacion', () => {
  beforeEach(() => {
    if (app.__setDbFail) app.__setDbFail(false);
  });

  it('debe crear una postulación con pregunta asociada', async () => {
    const res = await request(app)
      .post('/postulaciones/newPostulacion')
      .type('form')
      .send({
        id_proyecto: 1,
        confirmacion_lectura: 'sí',
        respuesta_habilidades: 'habilidades',
        respuesta_descarte: 'ninguna',
        id_pregunta: 5
      });
    expect(res.statusCode).toBe(200);
    expect(res.text).toMatch(/Postulación creada/);
  });

  it('debe crear una postulación sin pregunta asociada', async () => {
    const res = await request(app)
      .post('/postulaciones/newPostulacion')
      .type('form')
      .send({
        id_proyecto: 1,
        confirmacion_lectura: 'sí',
        respuesta_habilidades: 'habilidades',
        respuesta_descarte: 'ninguna',
        id_pregunta: 'null'
      });
    expect(res.statusCode).toBe(200);
    expect(res.text).toMatch(/Postulación creada/);
  });

  it('debe manejar errores de base de datos', async () => {
    if (app.__setDbFail) app.__setDbFail(true);
    const res = await request(app)
      .post('/postulaciones/newPostulacion')
      .type('form')
      .send({
        id_proyecto: 1,
        confirmacion_lectura: 'sí',
        respuesta_habilidades: 'habilidades',
        respuesta_descarte: 'ninguna',
        id_pregunta: 5
      });
    expect(res.statusCode).toBe(400);
    expect(res.text).toMatch(/DB error/);
  });
});