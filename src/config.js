// src/config.js

import dotenv from 'dotenv';
dotenv.config();

// get env variables
const {
  PORTAL_BASE_URL,
  PORTAL_URL,
  SERVER_BASE_URL,
  SERVER_URL,
  ADMIN_USERNAME,
  ADMIN_PASSWORD,
  SESSION_SECRET,
  HOST,
  PORT,
  CLIENT_ID,
  CLIENT_SECRET,
  FRONTEND_URL,
} = process.env;

// create config object
const config = {
  PORTAL_BASE_URL,
  PORTAL_URL,
  SERVER_BASE_URL,
  SERVER_URL,
  ADMIN_USERNAME,
  ADMIN_PASSWORD,
  SESSION_SECRET,
  HOST,
  PORT,
  CLIENT_ID,
  CLIENT_SECRET,
  FRONTEND_URL
};
config.REDIRECT_URI = `${config.FRONTEND_URL}/oauthCallback`;

export default config;