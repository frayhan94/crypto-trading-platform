import { PositionType, RiskLevel } from '../../domain/entities/TradingPlan';

export interface CreateTradingPlanDTO {
  userId: string;
  name: string;
  description?: string;
  entryPrice: number;
  stopLoss: number;
  takeProfit: number;
  leverage: number;
  positionType: PositionType;
  riskPercentage: number;
  accountBalance: number;
  liquidationPrice: number;
  positionSize: number;
  marginRequired: number;
  orderValue: number;
  potentialProfit: number;
  potentialLoss: number;
  riskRewardRatio: number;
  maxLossPercentage: number;
  riskLevel: RiskLevel;
  recommendations: string[];
}

export interface CreateTradingPlanResponse {
  success: boolean;
  data?: {
    id: string;
    name: string;
    status: string;
    createdAt: Date;
  };
  error?: string;
}
