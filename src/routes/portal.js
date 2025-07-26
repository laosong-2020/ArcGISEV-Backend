// src/routes/portal.js
import express from 'express';
import axios from 'axios';
import https from 'https';

import config from '../config.js';
import enterprise from '../services/enterpriseModel.js';

const router = express.Router();

// under dev mode, ignore ssl 
const httpsAgent = new https.Agent({ rejectUnauthorized: false });

const {
  PORTAL_URL,
} = config;

if (!PORTAL_URL) {
  throw new Error('Missing PORTAL_URL in .env');
}

// get portal health check
// this call will be called every 5 seconds by frontend
// this call will be forwarded to real portal instance
router.get('/healthCheck', async (req, res) => {
  try {
    // const portalToken = req.session.accessToken;
    const params = {
      f: 'json'
    };
    const resp = await axios.get(
      `${PORTAL_URL}/portaladmin/healthCheck`,
      {
        params: params,
        httpsAgent,
      }
    )
    if (!resp.data) {
      throw new Error('Invalid response from portal admin');
    }
    return res.json({ success: true, data: resp.data });
  } catch (err) {
    console.error('Error fetching health check:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
})

// get portal meta info from enterprise model
/**
 * The expected response is like:
 * {
 *   baseUrl: 'https://portal.example.com',
 *   url: 'https://portal.example.com/portal',
 *   version: '10.1',
 *   build: '1234567890',
 *   machineName: 'portal-machine',
 *   machineIp: '192.168.1.100',
 *   httpPort: 80,
 *   httpsPort: 443,
 *   id: 'portal-id',
 * }
 */
router.get('/metaInfo', async (req, res) => {
  try {
    const portalMetaInfo = enterprise._portal;
    return res.json({ success: true, data: portalMetaInfo });
  } catch (err) {
    console.error('Error fetching portal meta info:', err);
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
  const portalUrl = enterprise._portal.url;
  const logQueryEndpoint = `${portalUrl}/portaladmin/logs/query`;

  // 2. 
  const body = {
    level,
    startTime: startTime || '',
    endTime: endTime || '',
    filterType: 'json',
    filter: JSON.stringify({ codes: [], users: [], source: '*' }),
    pageSize: 1000,
    federatedServers: [],
    token: req.session.accessToken,
    f: 'json',
  }

  try {
    // 3. query logs from portal
    const resp = await axios.post(logQueryEndpoint, new URLSearchParams(body).toString(), {
      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
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
