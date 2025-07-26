// src/routes/datastore.js

import express from "express";

import enterprise from "../services/enterpriseModel.js";

const router = express.Router();

// get data stores meta info from enterprise model
/**
 * The expected response is like:
 * 
 */
router.get('/all', async (req, res) => {
  try {
    const dataStores = enterprise._dataStores;
    return res.json({
      success: true,
      data: dataStores,
    });
  } catch (err) {
    console.error('Error fetching data stores:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
})

// get data stores meta info from enterprise model
/**
 * The expected response is like:
 * {
 *   id: 'dataStore-id',
 *   path: '/dataStore/path',
 *   type: 'dataStore-type',
 * }[]
 */
router.get('/metaInfo', async (req, res) => {
  try {
    const dataStores = enterprise._dataStores;
    const metaInfo = dataStores.map(dataStore => {
      return {
        id: dataStore.id,
        path: dataStore.path,
        type: dataStore.type,
      }
    })
    return res.json({ success: true, data: metaInfo });
  } catch (err) {
    console.error('Error fetching data stores meta info:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
})

export default router;