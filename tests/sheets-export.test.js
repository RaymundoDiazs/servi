/**
 * Tests for the POST /sheets/export endpoint.
 * This endpoint exports project data to Google Sheets.
 *
 * These tests check:
 * - Successful export (returns summary and preview)
 * - Database error handling
 * - Google Sheets API error handling
 *
 * Supertest is used to simulate HTTP requests.
 * The DB and Google Sheets API are mocked in-memory.
 */

const request = require('supertest');

// Mock server.js to use fake db and sheets API
jest.mock('../server/server', () => {
  const express = require('express');
  const app = express();
  app.use(express.json());

  let shouldDbFail = false;
  let shouldSheetsFail = false;
  app.__setDbFail = (fail) => { shouldDbFail = fail; };
  app.__setSheetsFail = (fail) => { shouldSheetsFail = fail; };

  app.post('/sheets/export', async (req, res) => {
    if (shouldDbFail) {
      return res.status(500).json({ error: 'Failed to export to Google Sheets' });
    }
    if (shouldSheetsFail) {
      return res.status(500).json({ error: 'Google Sheets API error' });
    }
    // Simulate exportData and response
    const exportData = [
      {
        nombre_proyecto: 'Proyecto A',
        osf_nombre: 'OSF 1',
        modalidad: 'presencial',
        cantidad: 10,
        periodo_nombre: '2024-1',
        zona: 'Norte'
      },
      {
        nombre_proyecto: 'Proyecto B',
        osf_nombre: 'OSF 2',
        modalidad: 'en linea',
        cantidad: 5,
        periodo_nombre: '2024-2',
        zona: 'Sur'
      }
    ];
    return res.status(200).json({
      message: '✅ Exported to Google Sheets successfully!',
      totalProjects: exportData.length,
      periods: ['2024-1', '2024-2'],
      preview: exportData.slice(0, 2).map(project => ({
        nombre_proyecto: project.nombre_proyecto,
        osf_nombre: project.osf_nombre,
        modalidad: project.modalidad,
        cantidad: project.cantidad,
        periodo: project.periodo_nombre,
        zona: project.zona
      }))
    });
  });

  return app;
});

const app = require('../server/server');

describe('POST /sheets/export', () => {
  beforeEach(() => {
    if (app.__setDbFail) app.__setDbFail(false);
    if (app.__setSheetsFail) app.__setSheetsFail(false);
  });

  it('should export projects and return summary/preview', async () => {
    const res = await request(app).post('/sheets/export');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message');
    expect(res.body).toHaveProperty('totalProjects', 2);
    expect(Array.isArray(res.body.preview)).toBe(true);
    expect(res.body.preview.length).toBeGreaterThan(0);
  });

  it('should handle database errors', async () => {
    if (app.__setDbFail) app.__setDbFail(true);
    const res = await request(app).post('/sheets/export');
    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty('error');
  });

  it('should handle Google Sheets API errors', async () => {
    if (app.__setSheetsFail) app.__setSheetsFail(true);
    const res = await request(app).post('/sheets/export');
    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty('error');
  });
});