// server/server.test.j
const express = require('express');
const session = require('express-session');
const request = require('supertest');
const jest = require('jest-mock');

// --- Mock (verifica llamadas a funciones con parámetros específicos) ---
test('Mock: res.send es llamado con el objeto de sesión', async () => {
  const db = { oneOrNone: jest.fn().mockResolvedValue({ correo: 'a@a.com', contrasena: 'pass', user_id: 2, tipo: 'admin' }) };
  const req = { body: { username: 'a@a.com', password: 'pass' }, session: {} };
  const res = { send: jest.fn(), status: jest.fn().mockReturnThis() };
  // Simulación del manejador de login
  await (async function(req, res, db) {
    const data = await db.oneOrNone('', [req.body.username]);
    if (data && data.contrasena === req.body.password) {
      req.session.user_id = data.user_id;
      req.session.tipo = data.tipo;
      req.session.correo = data.correo;
      res.send(req.session);
    } else {
      res.status(401).send({});
    }
  })(req, res, db);
  expect(res.send).toHaveBeenCalledWith({ user_id: 2, tipo: 'admin', correo: 'a@a.com' });
});
