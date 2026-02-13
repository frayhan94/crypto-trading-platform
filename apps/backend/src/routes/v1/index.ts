import { Hono } from 'hono';
import { planRoutes } from './plans';

const v1Routes = new Hono();

// Mount v1 routes
v1Routes.route('/plans', planRoutes);

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
