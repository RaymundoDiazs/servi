// server/server.test.j
const express = require('express');
const session = require('express-session');
const request = require('supertest');
const jest = require('jest-mock');

// --- Dummy (objeto de relleno) ---
test('Dummy: el objeto request se pasa pero no se usa', () => {
  function handler(req, res) {
    res.send('ok');
  }
  const req = {}; // objeto dummy
  const res = { send: jest.fn() };
  handler(req, res);
  expect(res.send).toHaveBeenCalledWith('ok');
});