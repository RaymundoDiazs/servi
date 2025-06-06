const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');
const nodemailer = require('nodemailer');

// Load OAuth2 credentials
const CREDENTIALS_PATH = path.join(__dirname, '../env/client_secret_195575088614-lsu4amvphautte6ul6k6t7tued9coa1g.apps.googleusercontent.com.json');
const TOKEN_PATH = path.join(__dirname, '../env/token.json'); // Save token after first auth

const SCOPES = ['https://www.googleapis.com/auth/gmail.send'];

async function authorize() {
  const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH));
  const { client_secret, client_id, redirect_uris } = credentials.web;
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

  if (fs.existsSync(TOKEN_PATH)) {
    const token = JSON.parse(fs.readFileSync(TOKEN_PATH));
    oAuth2Client.setCredentials(token);
  } else {
    throw new Error('Token not found. Run OAuth2 flow to generate token.json');
  }

  return oAuth2Client;
}

async function sendEmail(to, name, subject, content) {
  const auth = await authorize();
  const gmail = google.gmail({ version: 'v1', auth });

  const emailLines = [
    `To: ${to}`,
    'Subject: =?UTF-8?B?' + Buffer.from(subject).toString('base64') + '?=',
    'Content-Type: text/plain; charset="UTF-8"',
    'Content-Transfer-Encoding: 7bit',
    '',
    content
  ];


  const email = emailLines.join('\n');
  const encodedMessage = Buffer.from(email).toString('base64').replace(/\+/g, '-').replace(/\//g, '_');

  await gmail.users.messages.send({
    userId: 'me',
    requestBody: {
      raw: encodedMessage,
    },
  });
}

module.exports = { sendEmail };
