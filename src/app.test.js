// src/app.test.js

import { describe, it, expect } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import topologyRouter from './routes/topology.js';
import tokenRouter from './routes/token.js';

const app = express();
app.use('/api/topology', topologyRouter);
app.use('/api/token', tokenRouter);

describe('GET /api/topology', () => {
  it('should return a topology', async () => {
    const response = await request(app).get('/api/topology');
    expect(response.status).toBe(200);
  });
});

describe('GET /api/token', () => {
  it('should return a token', async () => {
    const response = await request(app).get('/api/token');
    expect(response.status).toBe(200);
  });
});