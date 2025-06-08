/**
 * Pruebas unitarias para las funciones refactorizadas de getToken.js.
 * Se mockean fs y googleapis para evitar dependencias externas.
 */

jest.mock('fs');
jest.mock('googleapis');

const fs = require('fs');
const { google } = require('googleapis');

const {
  getOAuth2Client,
  generateAuthUrl,
  getTokenFromCode,
  CREDENTIALS_PATH,
  TOKEN_PATH,
  SCOPES,
} = require('../server/getToken');

describe('getToken.js funciones unitarias', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('getOAuth2Client retorna un cliente OAuth2 con credenciales correctas', () => {
    fs.readFileSync.mockReturnValueOnce(JSON.stringify({
      web: { client_id: 'id', client_secret: 'secret', redirect_uris: ['uri'] }
    }));

    const mockOAuth2 = jest.fn();
    google.auth.OAuth2 = mockOAuth2;

    getOAuth2Client();

    expect(fs.readFileSync).toHaveBeenCalledWith(CREDENTIALS_PATH);
    expect(mockOAuth2).toHaveBeenCalledWith('id', 'secret', 'uri');
  });

  it('generateAuthUrl genera la URL correctamente', () => {
    const fakeClient = {
      generateAuthUrl: jest.fn().mockReturnValue('http://fake-url')
    };
    const url = generateAuthUrl(fakeClient);
    expect(fakeClient.generateAuthUrl).toHaveBeenCalledWith({
      access_type: 'offline',
      scope: SCOPES,
    });
    expect(url).toBe('http://fake-url');
  });

  it('getTokenFromCode guarda el token correctamente', done => {
    const fakeClient = {
      getToken: jest.fn((code, cb) => cb(null, { access_token: 'token' })),
      setCredentials: jest.fn(),
    };
    fs.writeFileSync.mockClear();

    getTokenFromCode(fakeClient, 'code123', (err, token) => {
      expect(err).toBeNull();
      expect(fakeClient.setCredentials).toHaveBeenCalledWith({ access_token: 'token' });
      expect(fs.writeFileSync).toHaveBeenCalledWith(TOKEN_PATH, JSON.stringify({ access_token: 'token' }));
      expect(token).toEqual({ access_token: 'token' });
      done();
    });
  });

  it('getTokenFromCode maneja error al obtener el token', done => {
    const fakeClient = {
      getToken: jest.fn((code, cb) => cb(new Error('fail'), null)),
      setCredentials: jest.fn(),
    };

    getTokenFromCode(fakeClient, 'code123', (err, token) => {
      expect(err).toBeInstanceOf(Error);
      expect(token).toBeUndefined();
      done();
    });
  });
});