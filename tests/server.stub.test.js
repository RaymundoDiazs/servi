// server/server.test.j
const express = require('express');
const session = require('express-session');
const request = require('supertest');
const jest = require('jest-mock');

// --- Stub (respuesta fija predeterminada) ---
test('Stub: la base de datos siempre devuelve null (usuario no encontrado)', async () => {
  const stubDb = { oneOrNone: jest.fn().mockResolvedValue(null) };
  const login = async (req, res, db) => {
    const { username, password } = req.body;
    const data = await db.oneOrNone('', [username]);
    if (data && data.contrasena === password) {
      res.send({ success: true });
    } else {
      res.status(401).send({ success: false });
    }
  };
  const req = { body: { username: 'nobody@mail.com', password: 'wrong' } };
  const res = { send: jest.fn(), status: jest.fn().mockReturnThis() };
  await login(req, res, stubDb);
  expect(res.status).toHaveBeenCalledWith(401);
  expect(res.send).toHaveBeenCalledWith({ success: false });
});