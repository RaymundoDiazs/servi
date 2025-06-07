// server/server.test.j
const express = require('express');
const session = require('express-session');
const request = require('supertest');
const jest = require('jest-mock');

// --- Spy (verifica cuántas veces fue llamada una función) ---
test('Spy: res.status se llama una vez al fallar el login', async () => {
  const db = { oneOrNone: jest.fn().mockResolvedValue({ correo: 'a@a.com', contrasena: 'pass', user_id: 2, tipo: 'admin' }) };
  const req = { body: { username: 'a@a.com', password: 'wrong' }, session: {} };
  const res = { send: jest.fn(), status: jest.fn().mockReturnThis() };
  await (async function(req, res, db) {
    const data = await db.oneOrNone('', [req.body.username]);
    if (data && data.contrasena === req.body.password) {
      res.send({ ok: true });
    } else {
      res.status(401).send({ ok: false });
    }
  })(req, res, db);
  expect(res.status).toHaveBeenCalledTimes(1);
  expect(res.status).toHaveBeenCalledWith(401);
});