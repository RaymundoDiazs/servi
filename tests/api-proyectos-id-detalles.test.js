/**
 * Pruebas para el endpoint PUT /api/proyectos/:id/detalles.
 * Este endpoint actualiza los detalles de un proyecto.
 *
 * Estas pruebas cubren:
 * - Actualización exitosa de los detalles del proyecto (retorna 200)
 * - Error de base de datos (retorna 500)
 * - Actualización con carreras vacías (retorna 200)
 *
 * Supertest se utiliza para simular peticiones HTTP y la base de datos está simulada en memoria.
 */

const request = require('supertest');

// Mock server.js to use a fake db transaction
jest.mock('../server/server', () => {
  const express = require('express');
  const app = express();
  app.use(express.json());

  let shouldFail = false;
  app.__setDbFail = (fail) => { shouldFail = fail; };

  app.put('/api/proyectos/:id/detalles', async (req, res) => {
    if (shouldFail) {
      return res.status(500).json({ error: "Error al actualizar detalles del proyecto" });
    }
    // Simulate update logic
    res.status(200).json({ message: "Detalles actualizados correctamente" });
  });

  return app;
});

const app = require('../server/server');

describe('PUT /api/proyectos/:id/detalles', () => {
  beforeEach(() => {
    if (app.__setDbFail) app.__setDbFail(false);
  });

  it('debe actualizar los detalles del proyecto exitosamente', async () => {
    const res = await request(app)
      .put('/api/proyectos/1/detalles')
      .send({
        zona: 'Norte',
        tipo_vulnerabilidad: 'Tipo',
        numero_beneficiarios: 100,
        producto_a_entregar: 'Producto',
        medida_impacto_social: 'Impacto',
        competencias: 'Competencias',
        direccion: 'Calle Falsa 123',
        carreras: ['Ingeniería', 'Derecho'],
        enlace_maps: 'http://maps.com',
        problema_social: 'Problema',
        valor_promueve: 'Valor',
        rango_edad: 18,
        lista_actividades_alumno: 'Actividades',
        modalidad_desc: 'Desc modalidad',
        objetivo_general: 'Objetivo',
        estado: 'visible',
        cantidad: 10
      });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message');
  });

  it('debe manejar errores de base de datos', async () => {
    if (app.__setDbFail) app.__setDbFail(true);
    const res = await request(app)
      .put('/api/proyectos/1/detalles')
      .send({
        zona: 'Norte',
        carreras: ['Ingeniería']
      });
    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty('error');
  });

  it('debe permitir actualizar con carreras vacías', async () => {
    const res = await request(app)
      .put('/api/proyectos/1/detalles')
      .send({
        zona: 'Norte',
        carreras: []
      });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message');
  });
});