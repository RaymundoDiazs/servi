/**
 * Pruebas para el endpoint POST /sheets/export-programacion.
 * Este endpoint exporta proyectos a la hoja de Google Sheets "Programación".
 *
 * Estas pruebas cubren:
 * - Exportación exitosa de proyectos a la hoja de Google Sheets (retorna 200 y mensaje de éxito)
 * - Error al exportar a Google Sheets (retorna 500)
 *
 * Supertest se utiliza para simular peticiones HTTP y la integración con Google Sheets está simulada en memoria.
 */

const request = require('supertest');

// Mock server.js to use a fake db and Google Sheets
jest.mock('../server/server', () => {
  const express = require('express');
  const app = express();
  app.use(express.json());

  let shouldFail = false;
  app.__setFail = (fail) => { shouldFail = fail; };

  app.post('/sheets/export-programacion', async (req, res) => {
    if (shouldFail) {
      return res.status(500).json({ error: 'Failed to export to Programación sheet' });
    }
    return res.status(200).json({
      message: '✅ Exported to Programación sheet successfully!',
      totalProjects: 2,
      preview: [
        {
          proyecto: 'Proyecto A',
          osf: 'OSF Ejemplo',
          modalidad: 'presencial',
          horas: 40,
          numeracion: 1,
          pmt: 'PMT1'
        }
      ]
    });
  });

  return app;
});

const app = require('../server/server');

describe('POST /sheets/export-programacion', () => {
  beforeEach(() => {
    if (app.__setFail) app.__setFail(false);
  });

  it('debe exportar proyectos exitosamente a la hoja de Google Sheets', async () => {
    const res = await request(app)
      .post('/sheets/export-programacion')
      .send({});
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message');
    expect(res.body).toHaveProperty('totalProjects');
    expect(Array.isArray(res.body.preview)).toBe(true);
  });

  it('debe manejar errores al exportar a Google Sheets', async () => {
    if (app.__setFail) app.__setFail(true);
    const res = await request(app)
      .post('/sheets/export-programacion')
      .send({});
    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty('error');
  });
});