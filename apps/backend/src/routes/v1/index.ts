import { Hono } from 'hono';
import { planRoutes } from './plans.js';

const v1Routes = new Hono();

// Mount v1 routes
v1Routes.route('/plans', planRoutes);

// Health check endpoints
v1Routes.get('/health', (c) => {
  return c.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
});

v1Routes.get('/health/ready', (c) => {
  return c.json({
    ready: true,
    timestamp: new Date().toISOString(),
  });
});

// V1 info endpoint
v1Routes.get('/', (c) => {
  return c.json({
    version: 'v1',
    description: 'Crypto Trading Platform API v1',
    endpoints: {
      plans: '/v1/plans',
    }
  });
});

export { v1Routes };
