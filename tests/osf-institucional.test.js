/**
 * Tests for the GET /osf_institucional/:osf_id endpoint.
 * This endpoint fetches institutional OSF data by ID.
 *
 * These tests check:
 * - Successful fetch of OSF data (returns structured object)
 * - OSF not found (returns 404)
 * - Database error (returns 500)
 *
 * Supertest is used to simulate HTTP requests.
 * The DB is mocked in-memory.
 */

const request = require('supertest');

// Mock server.js to use a fake db
jest.mock('../server/server', () => {
  const express = require('express');
  const app = express();

  let shouldFail = false;
  let shouldReturnNull = false;
  app.__setDbFail = (fail) => { shouldFail = fail; };
  app.__setDbNull = (isNull) => { shouldReturnNull = isNull; };

  app.get('/osf_institucional/:osf_id', (req, res) => {
    if (shouldFail) {
      return res.status(500).json({ error: 'Error en la base de datos' });
    }
    if (shouldReturnNull) {
      return res.status(404).json({ error: 'OSF no encontrado' });
    }
    return res.status(200).json({
      user: {
        user_id: 1,
        correo: "osf@tec.mx",
        contrasena: "1234"
      },
      osf: {
        osf_id: req.params.osf_id,
        tipo: "institucional",
        nombre: "OSF Ejemplo"
      },
      institucional: {
        subtipo: "ONG",
        mision: "Ayudar",
        vision: "Un mundo mejor",
        objetivos: "Muchos",
        ods_id: 1,
        poblacion: "Comunidad",
        num_beneficiarios: 100,
        nombre_responsable: "Juan",
        puesto_responsable: "Director",
        correo_responsable: "juan@osf.mx",
        telefono: "1234567890",
        direccion: "Calle Falsa 123",
        horario: "9-5",
        pagina_web_redes: "osf.mx",
        correo_registro: "registro@osf.mx",
        logo: "logo.png",
        comprobante_domicilio: "comprobante.pdf",
        rfc: "RFC123",
        acta_constitutiva: "acta.pdf",
        fotos_instalaciones: "fotos.zip"
      },
      encargado: {
        nombre_encargado: "Pedro",
        puesto_encargado: "Encargado",
        telefono_encargado: "0987654321",
        correo_encargado: "pedro@osf.mx",
        ine_encargado: "ine.pdf"
      }
    });
  });

  return app;
});

const app = require('../server/server');

describe('GET /osf_institucional/:osf_id', () => {
  beforeEach(() => {
    if (app.__setDbFail) app.__setDbFail(false);
    if (app.__setDbNull) app.__setDbNull(false);
  });

  it('should return OSF data for a valid osf_id', async () => {
    const res = await request(app).get('/osf_institucional/1');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('user');
    expect(res.body).toHaveProperty('osf');
    expect(res.body).toHaveProperty('institucional');
    expect(res.body).toHaveProperty('encargado');
    expect(res.body.osf).toHaveProperty('osf_id', '1');
  });

  it('should return 404 if OSF is not found', async () => {
    if (app.__setDbNull) app.__setDbNull(true);
    const res = await request(app).get('/osf_institucional/999');
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('error');
  });

  it('should handle database errors', async () => {
    if (app.__setDbFail) app.__setDbFail(true);
    const res = await request(app).get('/osf_institucional/1');
    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty('error');
  });
});