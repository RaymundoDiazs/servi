// getToken.js
const fs = require('fs');
const readline = require('readline');
const { google } = require('googleapis');

const CREDENTIALS_PATH = '../env/client_secret_195575088614-lsu4amvphautte6ul6k6t7tued9coa1g.apps.googleusercontent.com.json';
const TOKEN_PATH = '../env/token.json';
const SCOPES = ['https://www.googleapis.com/auth/gmail.send'];

function getOAuth2Client() {
  const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH));
  const { client_secret, client_id, redirect_uris } = credentials.web;
  return new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
}

function generateAuthUrl(oAuth2Client) {
  return oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
}

function getTokenFromCode(oAuth2Client, code, cb) {
  oAuth2Client.getToken(code, (err, token) => {
    if (err) return cb(err);
    oAuth2Client.setCredentials(token);
    fs.writeFileSync(TOKEN_PATH, JSON.stringify(token));
    cb(null, token);
  });
}

// Solo ejecuta el flujo interactivo si es llamado directamente
if (require.main === module) {
  const oAuth2Client = getOAuth2Client();
  const authUrl = generateAuthUrl(oAuth2Client);
  console.log('Authorize this app by visiting this URL:', authUrl);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    getTokenFromCode(oAuth2Client, code, (err, token) => {
      if (err) return console.error('Error retrieving access token', err);
      console.log('Token stored to', TOKEN_PATH);
    });
  });
}

module.exports = {
  getOAuth2Client,
  generateAuthUrl,
  getTokenFromCode,
  CREDENTIALS_PATH,
  TOKEN_PATH,
  SCOPES,
};
