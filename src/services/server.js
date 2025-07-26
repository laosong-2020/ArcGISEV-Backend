// src/services/server.js

import axios from 'axios';
import https from 'https';
import { URLSearchParams } from 'url';

import config from '../config.js';

const httpsAgent = new https.Agent({ rejectUnauthorized: false });

async function getServerInfo(token) {
  try {
    const { SERVER_URL } = config;
    const params = {
      f: 'pjson',
      token: token,
    };
    const resp = await axios.get(
      `${SERVER_URL}/admin/about`,
      {
        params: params,
        httpsAgent,
        headers: {
          'Accept': '*/*',
          'User-Agent': 'PostmanRuntime/7.44.1',
        },
      }
    );

    if (!resp.data) {
      throw new Error('Invalid response from server admin');
    }
    return resp.data;
  } catch (err) {
    console.error('Error fetching server info:', err);
    return null;
  }
}

async function getServerWebAdaptorInfo(token) {
  try {
    const { SERVER_URL } = config;
    const params = {
      f: 'pjson',
      token: token
    };
    const resp = await axios.get(
      `${SERVER_URL}/admin/system/webadaptors`,
      {
        params: params,
        httpsAgent,
        headers: {
          'Accept': '*/*',
          'User-Agent': 'PostmanRuntime/7.44.1',
        },
      }
    )
    if (!resp.data.webAdaptors[0]) {
      throw new Error("Invalid response from server webadaptors")
    }
    const data = resp.data.webAdaptors[0]
    return data;
  } catch (err) {
    console.error('Error fetching server web adaptor info:', err);
    return null;
  }
}

async function findFileShareStores(token) {
  try {
    const { SERVER_URL } = config;
    const params = new URLSearchParams({
      ancestorPath: '/fileShares',
      types: 'folder',
      f: 'pjson',
      token: token,
    });
    const resp = await axios.post(
      `${SERVER_URL}/admin/data/findItems`,
      params.toString(),
      {
        httpsAgent,
        headers: {
          'Accept': '*/*',
          'User-Agent': 'PostmanRuntime/7.44.1',
          'Content-Type': 'application/x-www-form-urlencoded'
        },
      }
    )
    if (!resp.data.items) {
      throw new Error("Invalid response from server webadaptors")
    }
    const data = resp.data.items
    return data;
  } catch (error) {
    console.error('Error fetching server web adaptor info:', error);
    return null;
  }
}

async function findBigDataStores(token) {
  try {
    const { SERVER_URL } = config;
    const params = new URLSearchParams({
      ancestorPath: '/fileShares',
      types: 'folder',
      decrypt: 'true',
      f: 'pjson',
      token: token,
    });
    const resp = await axios.post(
      `${SERVER_URL}/admin/data/findItems`,
      params.toString(),
      {
        httpsAgent,
        headers: {
          'Accept': '*/*',
          'User-Agent': 'PostmanRuntime/7.44.1',
          'Content-Type': 'application/x-www-form-urlencoded'
        },
      }
    )
    if (!resp.data.items) {
      throw new Error("Invalid response from server webadaptors")
    }
    const data = resp.data.items
    return data;
  } catch (error) {
    console.error('Error fetching server web adaptor info:', error);
    return null;
  }
}

async function findCloudStores(token) {
  try {
    const { SERVER_URL } = config;
    const params = new URLSearchParams({
      ancestorPath: '/cloudStores',
      types: 'cloudStore',
      decrypt: 'true',
      f: 'pjson',
      token: token,
    });
    const resp = await axios.post(
      `${SERVER_URL}/admin/data/findItems`,
      params.toString(),
      {
        httpsAgent,
        headers: {
          'Accept': '*/*',
          'User-Agent': 'PostmanRuntime/7.44.1',
          'Content-Type': 'application/x-www-form-urlencoded'
        },
      }
    )
    if (!resp.data.items) {
      throw new Error("Invalid response from server webadaptors")
    }
    const data = resp.data.items
    return data;
  } catch (error) {
    console.error('Error fetching server web adaptor info:', error);
    return null;
  }
}

async function findNoSQLDBs(token) {
  try {
    const { SERVER_URL } = config;
    const params = new URLSearchParams({
      ancestorPath: '/nosqlDatabases',
      f: 'pjson',
      token: token,
    });
    const resp = await axios.post(
      `${SERVER_URL}/admin/data/findItems`,
      params.toString(),
      {
        httpsAgent,
        headers: {
          'Accept': '*/*',
          'User-Agent': 'PostmanRuntime/7.44.1',
          'Content-Type': 'application/x-www-form-urlencoded'
        },
      }
    )
    if (!resp.data.items) {
      throw new Error("Invalid response from server webadaptors")
    }
    const data = resp.data.items
    return data;
  } catch (error) {
    console.error('Error fetching server web adaptor info:', error);
    return null;
  }
}

async function findRasterStores(token) {
  try {
    const { SERVER_URL } = config;
    const params = new URLSearchParams({
      ancestorPath: '/rasterStores',
      types: 'rasterStore',
      decrypt: 'true',
      f: 'pjson',
      token: token,
    });
    const resp = await axios.post(
      `${SERVER_URL}/admin/data/findItems`,
      params.toString(),
      {
        httpsAgent,
        headers: {
          'Accept': '*/*',
          'User-Agent': 'PostmanRuntime/7.44.1',
          'Content-Type': 'application/x-www-form-urlencoded'
        },
      }
    )
    if (!resp.data.items) {
      throw new Error("Invalid response from server webadaptors")
    }
    const data = resp.data.items
    return data;
  } catch (error) {
    console.error('Error fetching server web adaptor info:', error);
    return null;
  }
}

async function findobjectStores(token) {
  try {
    const { SERVER_URL } = config;
    const params = new URLSearchParams({
      ancestorPath: '/objectStores',
      f: 'pjson',
      token: token,
    });
    const resp = await axios.post(
      `${SERVER_URL}/admin/data/findItems`,
      params.toString(),
      {
        httpsAgent,
        headers: {
          'Accept': '*/*',
          'User-Agent': 'PostmanRuntime/7.44.1',
          'Content-Type': 'application/x-www-form-urlencoded'
        },
      }
    )
    if (!resp.data.items) {
      throw new Error("Invalid response from server webadaptors")
    }
    const data = resp.data.items
    return data;
  } catch (error) {
    console.error('Error fetching server web adaptor info:', error);
    return null;
  }
}

async function getDataStoreInfo(token) {
  try {
    const results = await Promise.allSettled([
      findFileShareStores(token),
      findBigDataStores(token),
      findCloudStores(token),
      findNoSQLDBs(token),
      findRasterStores(token),
      findobjectStores(token),
    ]);
    const allItems = [];
    const typeLabels =[
      'fileShare',
      'bigDataFileShare',
      'cloudStore',
      'noSQLDB',
      'rasterStore',
      'objectStore',
    ];

    results.forEach((result, idx) => {
      if (result.status === 'fulfilled' && Array.isArray(result.value)) {
        const taggedItems = result.value.map(item => ({
          ...item,
          storeType: typeLabels[idx],
        }));
        allItems.push(...taggedItems);
      } else {
        console.warn(`Skipping store type ${typeLabels[idx]} due to error or null`);
      }
    });

    return allItems;
  } catch (err) {
    console.error('Error fetching dataStore info:', err)
    return null;
  }
}

export {
  getServerInfo,
  getServerWebAdaptorInfo,
  getDataStoreInfo,
};