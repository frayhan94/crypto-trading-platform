import { Hono } from 'hono';
import { handle } from 'hono/vercel';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';

const app = new Hono().basePath('/api');

// Middleware
app.use('*', logger());
app.use('*', prettyJSON());
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

// Health routes
app.get('/health', (c) => {
  return c.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
});

app.get('/health/ready', (c) => {
  return c.json({
    ready: true,
    timestamp: new Date().toISOString(),
  });
});

// Risk calculation service (inline to avoid ESM issues)
const calculateLiquidationPrice = (
  entryPrice: number,
  leverage: number,
  isLong: boolean = true
): number => {
  const maintenanceMarginRate = 0.005;
  const liquidationThreshold = 1 - maintenanceMarginRate;

  if (isLong) {
    return entryPrice * (1 - (1 / leverage) * liquidationThreshold);
  } else {
    return entryPrice * (1 + (1 / leverage) * liquidationThreshold);
  }
};

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
};

// Risk routes
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

app.post('/risk/analyze', zValidator('json', tradingParamsSchema), async (c) => {
  const params = c.req.valid('json');
  
  try {
    const { balance, leverage, entryPrice, stopLoss, takeProfit, riskPercentage } = params;
    const isLong = params.positionType === 'long';

    const liquidationPrice = calculateLiquidationPrice(entryPrice, leverage, isLong);
    const riskAmount = balance * (riskPercentage / 100);
    const stopLossDistance = Math.abs(entryPrice - stopLoss);
    const positionSize = riskAmount / stopLossDistance;
    const positionValue = positionSize * entryPrice;
    const marginRequired = positionValue / leverage;
    const orderValue = marginRequired * leverage;
    const takeProfitDistance = Math.abs(takeProfit - entryPrice);
    const potentialProfit = positionSize * takeProfitDistance;
    const potentialLoss = positionSize * stopLossDistance;
    const riskRewardRatio = potentialProfit / potentialLoss;
    const maxLossPercentage = (potentialLoss / balance) * 100;
    const distanceToLiquidation = Math.abs(entryPrice - liquidationPrice);

    const calculations = {
      liquidationPrice,
      recommendedPositionSize: positionSize,
      positionSize,
      marginRequired,
      orderValue,
      potentialProfit,
      potentialLoss,
      riskRewardRatio,
      maxLossPercentage,
      distanceToLiquidation,
    };

    // Simulations
    const simulations = [
      {
        scenario: 'stopLossHit',
        resultBalance: balance - potentialLoss,
        pnl: -potentialLoss,
        pnlPercentage: -(potentialLoss / balance) * 100,
        description: `Stop loss hit at ${formatCurrency(stopLoss)}`
      },
      {
        scenario: 'takeProfitHit',
        resultBalance: balance + potentialProfit,
        pnl: potentialProfit,
        pnlPercentage: (potentialProfit / balance) * 100,
        description: `Take profit hit at ${formatCurrency(takeProfit)}`
      },
      {
        scenario: 'liquidation',
        resultBalance: balance * 0.1,
        pnl: -(balance * 0.9),
        pnlPercentage: -90,
        description: `Position liquidated - catastrophic loss of ${formatCurrency(balance * 0.9)}`
      }
    ];

    // Risk level
    let riskLevel: 'low' | 'medium' | 'high' | 'extreme' = 'low';
    if (maxLossPercentage > 10 || riskRewardRatio < 0.5) riskLevel = 'extreme';
    else if (maxLossPercentage > 5 || riskRewardRatio < 1) riskLevel = 'high';
    else if (maxLossPercentage > 2 || riskRewardRatio < 1.5) riskLevel = 'medium';

    // Recommendations
    const recommendations: string[] = [];
    if (riskLevel === 'extreme') {
      recommendations.push('Consider reducing position size significantly');
      recommendations.push('Your risk-reward ratio is unfavorable');
    }
    if (riskLevel === 'high') {
      recommendations.push('Consider using a tighter stop loss');
      recommendations.push('Reduce leverage to lower liquidation risk');
    }
    if (riskRewardRatio < 1.5) recommendations.push('Aim for at least 1.5:1 risk-reward ratio');
    if (maxLossPercentage > 2) recommendations.push('Professional traders risk 1-2% per trade');
    if (recommendations.length === 0) {
      recommendations.push('Your risk parameters look reasonable');
      recommendations.push('Always use stop losses to protect capital');
    }

    return c.json({
      success: true,
      data: {
        parameters: params,
        calculations,
        simulations,
        riskLevel,
        recommendations,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to analyze risk',
    }, 400);
  }
});

app.post('/risk/liquidation', zValidator('json', z.object({
  entryPrice: z.number().positive(),
  leverage: z.number().min(1).max(125),
  isLong: z.boolean().default(true),
})), async (c) => {
  const { entryPrice, leverage, isLong } = c.req.valid('json');
  const liquidationPrice = calculateLiquidationPrice(entryPrice, leverage, isLong);
  
  return c.json({
    success: true,
    data: { liquidationPrice, entryPrice, leverage, isLong },
  });
});

app.get('/risk/recommendations', (c) => {
  return c.json({
    success: true,
    data: {
      riskManagement: [
        { title: 'Position Sizing', description: 'Never risk more than 1-2% of your account on a single trade' },
        { title: 'Stop Loss', description: 'Always use a stop loss to limit potential losses' },
        { title: 'Risk-Reward', description: 'Aim for at least 1.5:1 to 2:1 risk-reward ratio' },
        { title: 'Leverage', description: 'Lower leverage reduces liquidation risk' },
        { title: 'Diversification', description: 'Spread risk across multiple positions' },
        { title: 'Emotional Control', description: 'Stick to your trading plan regardless of emotions' },
      ],
    },
  });
});

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

export default handle(app);
