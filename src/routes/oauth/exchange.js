// src/routes/oauth/exchange.js

import express from 'express';
import axios from 'axios';
import config from '../../config.js';
import enterprise from '../../services/enterpriseModel.js';

const router = express.Router();

// frontend will send a POST request containing the code
// we will exchange the code for a token
// we will return the token to the frontend
router.post('/exchange', async (req, res) => {
  const { code } = req.body;
  if (!code) {
    return res.status(400).json({ error: 'Missing authorization code' });
  }

  try {
    // 1. construct the request form
    const params = new URLSearchParams({
      client_id: config.CLIENT_ID,
      client_secret: config.CLIENT_SECRET,
      grant_type: 'authorization_code',
      code,
      redirect_uri: config.REDIRECT_URI,
    })
    // 2. Send the request to the token endpoint
    const resp = await axios.post(
      `${config.PORTAL_URL}/sharing/rest/oauth2/token`,
      params.toString(),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded'} }
    )

    // 3. get token payload
    const tokenPayload = resp.data
    const { 
      access_token: accessToken, 
      expires_in: expiresIn, 
      username, 
      ssl, 
      refresh_token: refreshToken, 
      refresh_token_expires_in: refreshTokenExpiresIn 
    } = tokenPayload;
    /*
    {
      "access_token": "...",
      "expires_in": 1799,
      "username": "admin",
      "ssl": true,
      "refresh_token": "...",
      "refresh_token_expires_in": 1209599
    }
    */
    const expiresAt = Date.now() + expiresIn * 1000;

    req.session.accessToken = accessToken;
    req.session.refreshToken = refreshToken;
    req.session.expiresAt = expiresAt;
    req.session.username = username;
    req.session.ssl = ssl;
    req.session.refreshTokenExpiresAt = Date.now() + refreshTokenExpiresIn * 1000;

    // 4. set all the enterprise info
    await enterprise._setAll(accessToken);

    // 5. return the token payload
    res.json({
      success: true,
      username,
      expiresAt,
    });
  } catch (error) {
    console.error('Error exchanging code for token:', error);
    res
      .status(error.response?.status || 500)
      .json({
        error: error.response?.data?.error || 'Failed to exchange authorization code for token'
      })
  }
});

// sign out
router.post('/signout', (req, res) => {
  req.session.destroy(() => {
    res.json({ success: true })
  })
  res.clearCookie('connect.sid');
  res.json({ success: true })
})

export default router;