// server/server.test.j
const express = require('express');
const session = require('express-session');
const request = require('supertest');
const jest = require('jest-mock');

// --- Fake (implementación funcional simple) ---
test('Fake: la base de datos falsa devuelve un usuario para login', async () => {
  // Base de datos falsa
  const fakeDb = {
    oneOrNone: jest.fn().mockResolvedValue({ correo: 'test@mail.com', contrasena: '123', user_id: 1, tipo: 'alumno' })
  };
  // Manejador mínimo de login
  const login = async (req, res, db) => {
    const { username, password } = req.body;
    const data = await db.oneOrNone('', [username]);
    if (data && data.contrasena === password) {
      res.send({ success: true });
    } else {
      res.status(401).send({ success: false });
    }
  };
  const req = { body: { username: 'test@mail.com', password: '123' } };
  const res = { send: jest.fn(), status: jest.fn().mockReturnThis() };
  await login(req, res, fakeDb);
  expect(res.send).toHaveBeenCalledWith({ success: true });
});
