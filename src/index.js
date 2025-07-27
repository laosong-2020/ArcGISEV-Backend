// src/index.js

import cors from 'cors'
import express from 'express'
import session from 'express-session'

import config from './config.js';
import enterprise from './services/enterpriseModel.js';

// Load routes
import oauthRouter from './routes/oauth/exchange.js';

import portalRouter from './routes/portal.js';
import serverRouter from './routes/server.js';
import dataStoreRouter from './routes/dataStore.js';

import topologyRouter from './routes/topology.js';

// Load middleware
import ensureToken from './middleware/token.js';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const {
  SESSION_SECRET,
  HOST,
  PORT,
} = config;

const app = express();

app.disable('etag');
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});

const corsOptions = {
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions)); // this line is critical, handles preflight requests

app.use(express.json());

app.locals.enterprise = enterprise;

app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false,
      maxAge: 24*60*60*1000,
    }
  })
);

app.use('/api/oauth', oauthRouter);

app.use('/api/portal', ensureToken, portalRouter);
app.use('/api/server', ensureToken, serverRouter);
app.use('/api/dataStore', ensureToken, dataStoreRouter);
app.use('/api/topology', ensureToken, topologyRouter);


app.listen(PORT, () => {
  console.log(`🚀 Server running on http://${HOST}:${PORT}`)
});