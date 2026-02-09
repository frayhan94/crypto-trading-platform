import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';
import { riskRoutes } from './routes/risk';
import { healthRoutes } from './routes/health';

const app = new Hono();

// Middleware
app.use('*', logger());
app.use('*', prettyJSON());
app.use('*', cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

// Routes
app.route('/api/health', healthRoutes);
app.route('/api/risk', riskRoutes);

// Root endpoint
app.get('/', (c) => {
  return c.json({
    name: 'Crypto Trading Platform API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/api/health',
      risk: '/api/risk',
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
