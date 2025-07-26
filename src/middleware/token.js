// src/middleware/token.js

import axios from 'axios';
import config from '../config.js';

export async function renewToken(refreshToken) {
  const params = new URLSearchParams({
    client_id: config.CLIENT_ID,
    client_secret: config.CLIENT_SECRET,
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
  })

  const resp = await axios.post(
    `${config.PORTAL_URL}/sharing/rest/oauth2/token`,
    params.toString(),
    { headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }}
  )

  console.log("token has been renewed. Now expires in", resp.data.expires_in, "seconds")
  return resp.data;
}

export async function ensureToken(req, res, next) {
  // 1. check if logged in
  if (!req.session.accessToken) {
    return res.status(401).json({ error: 'Not Authenticated'})
  }

  // 2. check if token needs refresh
  const now = Date.now();
  const buffer = 5*60*1000;
  if (now + buffer >= req.session.expiresAt) {
    console.log("token about to expire. Refreshing...")
    try {
      // 3. refresh token
      const { 
        access_token: accessToken, 
        refresh_token: refreshToken, 
        expires_in: expiresIn 
      } = await renewToken(
        req.session.refreshToken
      )

      // 4. update session
      req.session.accessToken = accessToken;
      req.session.refreshToken = refreshToken || req.session.refreshToken;
      req.session.expiresAt = now + (expiresIn * 1000);
    } catch (error) {
      console.error('Error refreshing token:', error);
      req.session.destroy(() => {
        res.status(401).json({ error: 'Session expired, please login again'})
      })
      return
    }
  }

  // 5. inject token into request
  req.accessToken = req.session.accessToken
  next()
}

export default ensureToken;