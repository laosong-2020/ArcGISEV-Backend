// src/routes/server.js

import express from 'express';
import axios from 'axios';
import https from 'https';
const router = express.Router();

import config from '../config.js';
import enterprise from '../services/enterpriseModel.js';

const httpsAgent = new https.Agent({ rejectUnauthorized: false });

const { SERVER_URL } = config;

if (!SERVER_URL) {
  throw new Error('Missing SERVER_URL in .env');
}

// get server health check
// this call will be called every 5 seconds by frontend
// this call will be forwarded to real server instance
router.get('/healthCheck', async (req, res) => {
  try {
    const serverToken = req.session.accessToken;
    const params = {
      f: 'json',
      token: serverToken,
    };
    const resp = await axios.get(
      `${SERVER_URL}/rest/info/healthCheck`,
      {
        params: params,
        httpsAgent,
      }
    )
    if (!resp.data) {
      throw new Error('Invalid response from server admin');
    }
    return res.json({ success: true, data: resp.data });
  } catch (err) {
    console.error('Error fetching health check:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// get server meta info from enterprise model
/**
 * The expected response is like:
 * {
 *   baseUrl: 'https://server.example.com',
 *   url: 'https://server.example.com/server',
 *   version: '10.1',
 *   build: '1234567890',
 *   machineName: 'server-machine',
 *   machineIp: '192.168.1.100',
 *   httpPort: 80,
 *   httpsPort: 443,
 *   id: 'server-id',
 * }
 */
router.get('/metaInfo', async (req, res) => {
  try {
    const serverMetaInfo = enterprise._server;
    return res.json({
      success: true,
      data: serverMetaInfo,
    });
  } catch (err) {
    console.error('Error fetching server meta info:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
})

router.get('/logs', async (req, res) => {
  const {
    level,
    page = 1,
    pageSize = 10,
    startTime,
    endTime,
  } = req.query;

  // 1. construct log query endpoint and body
  const serverUrl = enterprise._server.url;
  const logQueryEndpoint = `${serverUrl}/admin/logs/query`;

  // 2. 
  const params = new URLSearchParams({
    level: level || '',
    startTime: startTime || '',
    endTime: endTime || '',
    filterType: 'json',
    filter: JSON.stringify({ server: '*', services: '*', machines: '*' }),
    pageSize: '1000',
    token: req.session.accessToken,
    f: 'json'
  })

  try {
    // 3. query logs from server
    const resp = await axios.get(`${logQueryEndpoint}?${params.toString()}`, {
      httpsAgent,
    })
    const allLogs = resp.data.logMessages || [];

    // 4. filter logs by level
    // TODO: change filter rule here
    const filteredLogs = level
      ? allLogs.filter(log => log.level === level)
      : allLogs;
    
    // 5. paginate logs
    const pg = parseInt(page, 10);
    const ps = parseInt(pageSize, 10);
    const total = filteredLogs.length;
    const start = (pg -1) * ps;
    const pagedLogs = filteredLogs.slice(start, start + ps);
    // 6. return the logs back to frontend
    res.json({
      total,
      page: pg,
      pageSize: ps,
      data: pagedLogs,
    })
  } catch (err) {
    console.error("Query logs error: ", err);
    res.status(err.response?.status || 500).json({
      error: err.response?.data?.error || "Failed to query logs",
    })
  }
})

export default router;