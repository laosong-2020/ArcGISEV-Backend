// src/services/portal.js

import axios from 'axios';
import https from 'https';

const httpsAgent = new https.Agent({ rejectUnauthorized: false });
const { PORTAL_URL } = process.env;

async function getPortalWebAdaptorInfo(token) {
  try {
    const params = {
      f: 'pjson',
      token: token,
    };
    const resp = await axios.get(
      `${PORTAL_URL}/portaladmin/system/webadaptors`,
      {
        params: params,
        httpsAgent,
        headers: {
          'Accept': '*/*',
          'User-Agent': 'PostmanRuntime/7.44.1',
        }
      }
    )
    const data = resp.data.webAdaptors[0];
    return data;
  } catch (err) {
    console.error('Error fetching portal web adaptor info:', err);
    return null;
  }
}

async function getPortalInfo(token) {
  try {
    const params = {
      f: 'pjson',
      token: token,
    };
    const resp = await axios.get(
      `${PORTAL_URL}/portaladmin/about`,
      {
        params: params,
        httpsAgent,
        headers: {
          'Accept': '*/*',
          'User-Agent': 'PostmanRuntime/7.44.1',
        }
      }
    );
    if (!resp.data) {
      throw new Error('Invalid response from portal admin');
    }
    return resp.data.siteMap;
  } catch (err) {
    console.error('Error fetching portal info:', err);
    return null;
  }
}

export { getPortalWebAdaptorInfo, getPortalInfo };