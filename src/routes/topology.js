// src/routes/topology.js

import express from 'express';
const router = express.Router();

import enterprise from '../services/enterpriseModel.js';
// import { buildEdges } from '../services/edgeBuilder.js';

router.get('/', async (req, res) => {
  const nodes = []
  nodes.push({
    id: 'client',
    type: 'static',
    label: 'User Client',
    icon: 'client',
  })
  try {
    const token = req.session.accessToken;
    // construct nodes
    // get nodes info
    const portalWebAdaptorInfo = await enterprise._fetchAndSetPortalWAMetaInfo(token);
    // Add portal web adaptor node
    if (portalWebAdaptorInfo) {
      nodes.push({
        id: 'portalAdaptor',
        type: 'webAdaptor',
        label: 'Portal Web Adapter',
        icon: 'portal_webAdaptor',
        info: portalWebAdaptorInfo,
        status: 'healthy',
      })
    }

    const serverWebAdaptorInfo = await enterprise._fetchAndSetServerWAMetaInfo(token);
    // Add server web adaptor node
    if (serverWebAdaptorInfo) {
      nodes.push({
        id: 'serverAdaptor',
        type: 'webAdaptor',
        label: 'Server Web Adapter',
        icon: 'server_webAdaptor',
        info: serverWebAdaptorInfo,
        status: 'healthy',
      })
    }
    const portalInfo = await enterprise._fetchAndSetPortalMetaInfo(token);
    // Add portal info
    if (portalInfo) {
      nodes.push({
        id: 'portal',
        type: 'portal',
        label: 'Portal for ArcGIS',
        icon: 'portal',
        info: portalInfo,
        //status: portalInfo.success ? 'healthy' : 'error',
      })
    }
    const serverInfo = await enterprise._fetchAndSetServerMetaInfo(token);
    // Add server info
    if (serverInfo) {
      nodes.push({
        id: 'server',
        type: 'server',
        label: 'ArcGIS Server',
        icon: 'server',
        info: serverInfo,
        //status: serverInfo.success ? 'healthy' : 'error',
      })
    }
    const dataStoreInfo = await enterprise._fetchAndSetDataStores(token);
    // Add data store info
    if (dataStoreInfo) {
      nodes.push({
        id: 'dataStore',
        type: 'dataStore',
        label: 'Data Store',
        icon: 'dataStore',
        info: dataStoreInfo,
        status: 'healthy',
      })
    }

  } catch (err) {
    console.error('Error fetching nodes info:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
  // Construct edges
  try{
    await enterprise._updatePortalServerConnection(req.session.accessToken);
    await enterprise._updateServerDataStoreConnection(req.session.accessToken);
    const edges = await enterprise.connections;
    return res.status(200).json({
      success: true,
      data: {
        nodes: nodes,
        edges: edges,
        timestamp: Date.now(),
      }
    })
  } catch (err) {
    console.error('Error constructing edges:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
  
});

export default router;