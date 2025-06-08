/**
 * Pruebas para el script getToken.js.
 * Este script obtiene y almacena el token OAuth2 de Google.
 *
 * Estas pruebas cubren:
 * - Generación correcta de la URL de autorización
 * - Escritura exitosa del token en el archivo
 * - Manejo de error al obtener el token
 *
 * Se utilizan mocks para simular el sistema de archivos, readline y la API de Google.
 */

jest.mock('fs');
jest.mock('readline');

const fs = require('fs');
const readline = require('readline');

describe('getToken.js', () => {
  let OAuth2Mock, getTokenMock, rlMock;

  // Mock fs.readFileSync para cualquier archivo ANTES de los tests
  fs.readFileSync.mockImplementation(() => {
    return JSON.stringify({
      web: { client_id: 'id', client_secret: 'secret', redirect_uris: ['uri'] }
    });
  });

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();

    rlMock = {
      question: jest.fn(),
      close: jest.fn(),
    };
    readline.createInterface.mockReturnValue(rlMock);

    getTokenMock = jest.fn();
    OAuth2Mock = jest.fn().mockImplementation(() => ({
      generateAuthUrl: jest.fn().mockReturnValue('http://fake-auth-url'),
      getToken: getTokenMock,
      setCredentials: jest.fn(),
    }));

    jest.doMock('googleapis', () => ({
      google: {
        auth: { OAuth2: OAuth2Mock },
      },
    }));
  });

  it('debe generar la URL de autorización y mostrarla', () => {
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.isolateModules(() => {
      require('../server/getToken');
    });
    expect(logSpy).toHaveBeenCalledWith('Authorize this app by visiting this URL:', 'http://fake-auth-url');
    logSpy.mockRestore();
  });

  it('debe escribir el token en el archivo correctamente', () => {
    const token = { access_token: 'token' };
    getTokenMock.mockImplementation((code, cb) => cb(null, token));
    rlMock.question.mockImplementation((q, cb) => cb('code123'));

    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.isolateModules(() => {
      require('../server/getToken');
    });
    expect(fs.writeFileSync).toHaveBeenCalledWith('../env/token.json', JSON.stringify(token));
    logSpy.mockRestore();
  });

  it('debe manejar error al obtener el token', () => {
    const error = new Error('fail');
    getTokenMock.mockImplementation((code, cb) => cb(error, null));
    rlMock.question.mockImplementation((q, cb) => cb('code123'));

    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.isolateModules(() => {
      require('../server/getToken');
    });
    expect(errorSpy).toHaveBeenCalledWith('Error retrieving access token', error);
    errorSpy.mockRestore();
  });
});