/**
 * Pruebas para la función buildRawEmail de gmailService.js.
 * Estas pruebas cubren:
 * - Formato correcto del mensaje MIME
 * - Encoding base64 seguro para URL
 */

const { buildRawEmail } = require('../server/gmailService');

describe('buildRawEmail', () => {
  it('genera el mensaje MIME correctamente y lo codifica en base64 seguro para URL', () => {
    const to = 'destino@correo.com';
    const subject = 'Prueba';
    const content = 'Hola mundo';

    const raw = buildRawEmail(to, subject, content);

    // Decodifica para verificar el contenido
    const decoded = Buffer.from(raw.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8');
    expect(decoded).toContain(`To: ${to}`);
    expect(decoded).toContain('Subject: =?UTF-8?B?' + Buffer.from(subject).toString('base64') + '?=');
    expect(decoded).toContain('Content-Type: text/plain; charset="UTF-8"');
    expect(decoded).toContain('Content-Transfer-Encoding: 7bit');
    expect(decoded).toContain(content);
  });
});