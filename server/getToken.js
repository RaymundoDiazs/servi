// getToken.js
const fs = require('fs');
const readline = require('readline');
const { google } = require('googleapis');

const CREDENTIALS_PATH = '../env/client_secret_195575088614-lsu4amvphautte6ul6k6t7tued9coa1g.apps.googleusercontent.com.json';
const TOKEN_PATH = '../env/token.json';
const SCOPES = ['https://www.googleapis.com/auth/gmail.send'];

const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH));
const { client_secret, client_id, redirect_uris } = credentials.web;
const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

const authUrl = oAuth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: SCOPES,
});

console.log('Authorize this app by visiting this URL:', authUrl);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question('Enter the code from that page here: ', (code) => {
  rl.close();
  oAuth2Client.getToken(code, (err, token) => {
    if (err) return console.error('Error retrieving access token', err);
    oAuth2Client.setCredentials(token);
    fs.writeFileSync(TOKEN_PATH, JSON.stringify(token));
    console.log('Token stored to', TOKEN_PATH);
  });
});
