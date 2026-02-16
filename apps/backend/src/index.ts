import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';
import { v1Routes } from './routes/v1/index.js';

const app = new Hono();

// Middleware
app.use('*', logger());
app.use('*', prettyJSON());
app.use('*', cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000', 'http://127.0.0.1:3001'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// Versioned Routes
app.route('/api/v1', v1Routes);

// Root endpoint
app.get('/', (c) => {
  return c.json({
    name: 'Crypto Trading Platform API',
    version: '1.0.0',
    status: 'running',
    versions: {
      v1: '/api/v1',
    },
    endpoints: {
      'v1-plans': '/api/v1/plans',
    }
  });
});

// 404 handler
app.notFound((c) => {
  return c.json({ error: 'Not Found', message: 'The requested endpoint does not exist' }, 404);
});

// Error handler
app.onError((err, c) => {
  console.error('Server error:', err);
  return c.json({ error: 'Internal Server Error', message: err.message }, 500);
});

const port = Number(process.env.PORT) || 3001;

console.log(`🚀 Crypto Trading Platform API running on http://localhost:${port}`);

serve({
  fetch: app.fetch,
  port,
});

export default app;
