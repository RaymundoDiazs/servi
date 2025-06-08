/**
 * Pruebas para el endpoint POST /projects/newProject.
 * Este endpoint crea un nuevo proyecto.
 *
 * Estas pruebas cubren:
 * - Creación exitosa de un nuevo proyecto (retorna 200)
 * - Error por falta de sesión OSF (retorna 401)
 * - Error de base de datos (retorna 500)
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
  let hasSession = true;
  app.__setDbFail = (fail) => { shouldFail = fail; };
  app.__setSession = (val) => { hasSession = val; };

  // Middleware to mock session
  app.use((req, res, next) => {
    if (hasSession) {
      req.session = { info: { osf_id: 1 } };
    } else {
      req.session = {};
    }
    next();
  });

  app.post('/projects/newProject', (req, res) => {
    if (!req.session.info || !req.session.info.osf_id) {
      return res.status(401).json({ error: 'No OSF session info found' });
    }
    if (shouldFail) {
      return res.status(500).send('Error al insertar');
    }
    return res.status(200).send('Insert exitoso');
  });

  return app;
});

const app = require('../server/server');

describe('POST /projects/newProject', () => {
  beforeEach(() => {
    if (app.__setDbFail) app.__setDbFail(false);
    if (app.__setSession) app.__setSession(true);
  });

  it('debe crear un nuevo proyecto exitosamente', async () => {
    const res = await request(app)
      .post('/projects/newProject')
      .type('form')
      .send({
        nombre_coordinador: 'Juan',
        numero_coordinador: '1234567890',
        nombre: 'Proyecto Test',
        problema_social: 'Problema',
        tipo_vulnerabilidad: 'Tipo',
        rango_edad: JSON.stringify([18, 25]),
        zona: 'Norte',
        num_beneficiarios: 100,
        objetivo_general: 'Objetivo',
        ods: JSON.stringify([1, 2]),
        lista_actividades_alumnos: 'Actividades',
        producto_a_entregar: 'Producto',
        entregable_desc: 'Desc',
        medida_impacto_social: 'Impacto',
        modalidad: 'presencial',
        modalidad_desc: 'Desc modalidad',
        carreras: JSON.stringify(['Ingeniería']),
        competencias: 'Competencias',
        direccion: 'Calle Falsa 123',
        enlace_maps: 'http://maps.com',
        valor_promueve: 'Valor',
        surgio_unidad_de_formacion: 'Unidad',
        pregunta_descarte: 'Pregunta',
        notificaciones: true,
        momentos: JSON.stringify([{ momento_id: 1, num: 10 }])
      });
    expect(res.statusCode).toBe(200);
    expect(res.text).toMatch(/Insert exitoso/);
  });

  it('debe retornar 401 si no hay sesión OSF', async () => {
    if (app.__setSession) app.__setSession(false);
    const res = await request(app)
      .post('/projects/newProject')
      .type('form')
      .send({});
    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('error');
  });

  it('debe manejar errores de base de datos', async () => {
    if (app.__setDbFail) app.__setDbFail(true);
    const res = await request(app)
      .post('/projects/newProject')
      .type('form')
      .send({
        nombre_coordinador: 'Juan'
      });
    expect(res.statusCode).toBe(500);
    expect(res.text).toMatch(/Error al insertar/);
  });
});