/**
 * Pruebas para la función sendEmail de gmailService.js.
 * Estas pruebas cubren:
 * - Envío exitoso de correo (no lanza error)
 * - Error si falta el token de autenticación (lanza excepción)
 * - Error si falla el envío de correo (lanza excepción)
 *
 * Se utilizan mocks para simular la API de Google y el sistema de archivos.
 */

const fs = require('fs');
const path = require('path');

// Mock antes de requerir el módulo a testear
jest.mock('fs');
jest.mock('googleapis', () => {
  const sendMock = jest.fn();
  return {
    google: {
      auth: {
        OAuth2: jest.fn().mockImplementation(() => ({
          setCredentials: jest.fn(),
        })),
      },
      gmail: jest.fn().mockReturnValue({
        users: {
          messages: {
            send: sendMock,
          },
        },
      }),
    },
  };
});

// Requiere después de los mocks
const { sendEmail } = require('../server/gmailService');

describe('sendEmail', () => {
  const CREDENTIALS_PATH = path.join(__dirname, '../env/client_secret_195575088614-lsu4amvphautte6ul6k6t7tued9coa1g.apps.googleusercontent.com.json');
  const TOKEN_PATH = path.join(__dirname, '../env/token.json');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('debe enviar un correo exitosamente', async () => {
    fs.readFileSync.mockImplementation((filePath) => {
      if (filePath === CREDENTIALS_PATH) {
        return JSON.stringify({ web: { client_id: 'id', client_secret: 'secret', redirect_uris: ['uri'] } });
      }
      if (filePath === TOKEN_PATH) {
        return JSON.stringify({ access_token: 'token' });
      }
    });
    fs.existsSync.mockReturnValue(true);

    // Mock explícito para send
    const { google } = require('googleapis');
    google.gmail().users.messages.send.mockResolvedValue({});

    await expect(sendEmail('test@mail.com', 'Test', 'Subject', 'Content')).resolves.toBeUndefined();
    expect(google.gmail().users.messages.send).toHaveBeenCalled();
  });

  it('debe lanzar error si falta el token', async () => {
    fs.readFileSync.mockImplementation((filePath) => {
      if (filePath === CREDENTIALS_PATH) {
        return JSON.stringify({ web: { client_id: 'id', client_secret: 'secret', redirect_uris: ['uri'] } });
      }
    });
    fs.existsSync.mockReturnValue(false);

    await expect(sendEmail('test@mail.com', 'Test', 'Subject', 'Content')).rejects.toThrow('Token not found');
  });

  it('debe lanzar error si falla el envío de correo', async () => {
    fs.readFileSync.mockImplementation((filePath) => {
      if (filePath === CREDENTIALS_PATH) {
        return JSON.stringify({ web: { client_id: 'id', client_secret: 'secret', redirect_uris: ['uri'] } });
      }
      if (filePath === TOKEN_PATH) {
        return JSON.stringify({ access_token: 'token' });
      }
    });
    fs.existsSync.mockReturnValue(true);

    const { google } = require('googleapis');
    google.gmail().users.messages.send.mockRejectedValue(new Error('Gmail error'));

    await expect(sendEmail('test@mail.com', 'Test', 'Subject', 'Content')).rejects.toThrow('Gmail error');
  });
});