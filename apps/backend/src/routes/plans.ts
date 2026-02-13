import { Hono } from 'hono';
import { TradingPlanController } from '../presentation/controllers/TradingPlanController.js';

const controller = new TradingPlanController();
export const planRoutes = controller.getRoutes();
