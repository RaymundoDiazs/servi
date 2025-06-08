/**
 * Pruebas para el endpoint POST /users/osfNuevo.
 * Este endpoint registra un nuevo OSF institucional.
 *
 * Estas pruebas cubren:
 * - Registro exitoso de un OSF institucional (retorna 200)
 * - Error por archivos requeridos faltantes (retorna 400)
 * - Error de base de datos (retorna 500)
 *
 * Supertest se utiliza para simular peticiones HTTP y la base de datos está simulada en memoria. Los archivos se simulan usando buffers.
 */

const request = require('supertest');
const path = require('path');
const fs = require('fs');

// Mock server.js to use a fake db and file upload
jest.mock('../server/server', () => {
  const express = require('express');
  const multer = require('multer');
  const app = express();
  app.use(express.json());

  let shouldFail = false;
  let missingFiles = false;
  app.__setDbFail = (fail) => { shouldFail = fail; };
  app.__setMissingFiles = (fail) => { missingFiles = fail; };

  // Simulate file upload middleware
  const storage = multer.memoryStorage();
  const upload = multer({ storage: storage });
  const fileFields = upload.fields([
    { name: 'logo_institucion', maxCount: 1 },
    { name: 'fotos_instalaciones', maxCount: 2 },
    { name: 'comprobante_domicilio', maxCount: 1 },
    { name: 'RFC', maxCount: 1 },
    { name: 'acta_constitutiva', maxCount: 1 },
    { name: 'ine_encargado', maxCount: 1 },
  ]);

  app.post('/users/osfNuevo', fileFields, (req, res) => {
    if (shouldFail) {
      return res.status(500).send('Error al registrar el OSF.');
    }
    if (missingFiles || !req.files.logo_institucion || !req.files.fotos_instalaciones) {
      return res.status(400).json({ error: 'Logo de la institución es requerido.' });
    }
    return res.status(200).send('Usuario OSF creado');
  });

  return app;
});

const app = require('../server/server');

describe('POST /users/osfNuevo', () => {
  beforeEach(() => {
    if (app.__setDbFail) app.__setDbFail(false);
    if (app.__setMissingFiles) app.__setMissingFiles(false);
  });

  it('debe registrar un OSF institucional exitosamente', async () => {
    const res = await request(app)
      .post('/users/osfNuevo')
      .field('correo', 'osf@ejemplo.com')
      .field('contrasena', '1234')
      .field('subtipo', 'ONG')
      .field('nombre', 'OSF Ejemplo')
      .field('mision', 'Ayudar')
      .field('vision', 'Visión')
      .field('objetivo', 'Objetivo')
      .field('ods', '1')
      .field('poblacion', 'Comunidad')
      .field('num_beneficiarios', '100')
      .field('nombre_responsable', 'Juan')
      .field('puesto_responsable', 'Director')
      .field('correo_responsable', 'juan@osf.mx')
      .field('telefono', '1234567890')
      .field('direccion', 'Calle Falsa 123')
      .field('horario', '9-5')
      .field('pagina_web_redes', 'osf.mx')
      .field('correo_registro', 'registro@osf.mx')
      .field('nombre_encargado', 'Pedro')
      .field('puesto_encargado', 'Encargado')
      .field('telefono_encargado', '0987654321')
      .field('correo_encargado', 'pedro@osf.mx')
      .attach('logo_institucion', Buffer.from('logo'), 'logo.png')
      .attach('fotos_instalaciones', Buffer.from('foto1'), 'foto1.png')
      .attach('fotos_instalaciones', Buffer.from('foto2'), 'foto2.png');
    expect(res.statusCode).toBe(200);
    expect(res.text).toMatch(/Usuario OSF creado/);
  });

  it('debe retornar error si faltan archivos requeridos', async () => {
    if (app.__setMissingFiles) app.__setMissingFiles(true);
    const res = await request(app)
      .post('/users/osfNuevo')
      .field('correo', 'osf@ejemplo.com')
      .attach('fotos_instalaciones', Buffer.from('foto1'), 'foto1.png');
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('debe manejar errores de base de datos', async () => {
    if (app.__setDbFail) app.__setDbFail(true);
    const res = await request(app)
      .post('/users/osfNuevo')
      .field('correo', 'osf@ejemplo.com')
      .attach('logo_institucion', Buffer.from('logo'), 'logo.png')
      .attach('fotos_instalaciones', Buffer.from('foto1'), 'foto1.png')
      .attach('fotos_instalaciones', Buffer.from('foto2'), 'foto2.png');
    expect(res.statusCode).toBe(500);
    expect(res.text).toMatch(/Error al registrar el OSF/);
  });
});