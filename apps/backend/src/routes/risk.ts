import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { RiskService } from '../services/risk.service.js';

export const riskRoutes = new Hono();

const tradingParamsSchema = z.object({
  entryPrice: z.number().positive('Entry price must be positive'),
  stopLoss: z.number().positive('Stop loss must be positive'),
  takeProfit: z.number().positive('Take profit must be positive'),
  balance: z.number().positive('Balance must be positive'),
  accountBalance: z.number().positive('Account balance must be positive'),
  leverage: z.number().min(1).max(125, 'Leverage must be between 1 and 125'),
  riskPercentage: z.number().min(0.1).max(100, 'Risk percentage must be between 0.1 and 100'),
  positionType: z.enum(['long', 'short']),
});

// Analyze risk
riskRoutes.post('/analyze', zValidator('json', tradingParamsSchema), async (c) => {
  const params = c.req.valid('json');
  
  try {
    const analysis = RiskService.analyzeRisk(params);
    return c.json({
      success: true,
      data: analysis,
    });
  } catch (error) {
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to analyze risk',
    }, 400);
  }
});

// Calculate liquidation price
riskRoutes.post('/liquidation', zValidator('json', z.object({
  entryPrice: z.number().positive(),
  leverage: z.number().min(1).max(125),
  isLong: z.boolean().default(true),
})), async (c) => {
  const { entryPrice, leverage, isLong } = c.req.valid('json');
  
  const liquidationPrice = RiskService.calculateLiquidationPrice(entryPrice, leverage, isLong);
  
  return c.json({
    success: true,
    data: {
      liquidationPrice,
      entryPrice,
      leverage,
      isLong,
    },
  });
});

// Calculate position size
riskRoutes.post('/position-size', zValidator('json', z.object({
  balance: z.number().positive(),
  riskPercentage: z.number().min(0.1).max(100),
  entryPrice: z.number().positive(),
  stopLoss: z.number().positive(),
})), async (c) => {
  const { balance, riskPercentage, entryPrice, stopLoss } = c.req.valid('json');
  
  const positionSize = RiskService.calculatePositionSize(balance, riskPercentage, entryPrice, stopLoss);
  
  return c.json({
    success: true,
    data: {
      positionSize,
      riskAmount: balance * (riskPercentage / 100),
    },
  });
});

// Get risk recommendations
riskRoutes.get('/recommendations', (c) => {
  return c.json({
    success: true,
    data: RiskService.getRecommendations(),
  });
});
