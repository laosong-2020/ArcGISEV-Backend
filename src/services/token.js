// src/services/token.js

import axios from 'axios';
import https from 'https';
import config from '../config.js';

// under dev mode, ignore ssl
const httpsAgent = new https.Agent({ rejectUnauthorized: false });

let cachedPortalToken = null;
let portalTokenExpiration = 0;

async function fetchNewPortalToken() {
  const {
    PORTAL_URL,
    SERVER_URL,
    ADMIN_USERNAME,
    ADMIN_PASSWORD,
  } = config;

  if (!PORTAL_URL || !ADMIN_USERNAME || !ADMIN_PASSWORD) {
    throw new Error('Missing one of PORTAL_URL, ADMIN_USERNAME or ADMIN_PASSWORD in .env');
  }
  const params = new URLSearchParams({
    username: ADMIN_USERNAME,
    password: ADMIN_PASSWORD,
    client: 'referer',
    referer: SERVER_URL,
    expiration: '360',
    f: 'pjson',
  });

  const resp = await axios.post(
    `${PORTAL_URL}/sharing/rest/generateToken`,
    params.toString(),
    {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      httpsAgent,
    }
  );
  const { token, expires } = resp.data;
  if (!token) throw new Error('ArcGIS Portal did not return a token');

  const now = Date.now();
  portalTokenExpiration = now + (parseInt(expires, 10) - 60)*1000;
  cachedPortalToken = token;
  return token;
}

async function getToken() {
  if (cachedPortalToken && Date.now() < portalTokenExpiration) {
    return cachedPortalToken;
  }
  return await fetchNewPortalToken();
}



export { getToken, fetchNewPortalToken };