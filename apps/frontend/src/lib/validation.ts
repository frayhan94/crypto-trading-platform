import { z } from 'zod';

export const tradingFormSchema = z.object({
  entryPrice: z.number().min(0.01, 'Entry price must be greater than 0'),
  stopLoss: z.number().min(0.01, 'Stop loss must be greater than 0'),
  takeProfit: z.number().min(0.01, 'Take profit must be greater than 0'),
  accountBalance: z.number().min(0.01, 'Account balance must be greater than 0'),
  riskPercentage: z.number().min(0.1, 'Risk percentage must be at least 0.1%').max(100, 'Risk percentage cannot exceed 100%'),
  leverage: z.number().min(1, 'Leverage must be at least 1x').max(125, 'Leverage cannot exceed 125x'),
  positionType: z.enum(['long', 'short']),
  balance: z.number().min(0.01, 'Balance must be greater than 0'),
}).refine((data) => {
  // Validate logical relationships based on position type
  if (data.positionType === 'long') {
    return data.stopLoss < data.entryPrice && data.takeProfit > data.entryPrice;
  } else {
    return data.stopLoss > data.entryPrice && data.takeProfit < data.entryPrice;
  }
}, {
  message: 'Invalid position setup for the selected position type',
  path: ['positionType'],
});

export type TradingFormData = z.infer<typeof tradingFormSchema>;
