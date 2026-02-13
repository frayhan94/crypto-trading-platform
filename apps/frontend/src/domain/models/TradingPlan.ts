export enum PositionType {
  LONG = 'LONG',
  SHORT = 'SHORT'
}

export enum PlanStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  EXECUTED = 'EXECUTED',
  CANCELLED = 'CANCELLED'
}

export enum RiskLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  EXTREME = 'EXTREME'
}

export interface TradingParameters {
  entryPrice: number;
  stopLoss: number;
  takeProfit: number;
  leverage: number;
  positionType: PositionType;
  riskPercentage: number;
  accountBalance: number;
}

export interface RiskCalculations {
  liquidationPrice: number;
  recommendedPositionSize: number;
  positionSize: number;
  marginRequired: number;
  orderValue: number;
  potentialProfit: number;
  potentialLoss: number;
  riskRewardRatio: number;
  maxLossPercentage: number;
  distanceToLiquidation: number;
}

export interface SimulationResult {
  scenario: string;
  resultBalance: number;
  pnl: number;
  pnlPercentage: number;
  description: string;
}

export interface TradingPlan {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  status: PlanStatus;
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
  createdAt: Date;
  updatedAt: Date;
  executedAt: Date | null;
}

export interface RiskAnalysis {
  parameters: TradingParameters;
  calculations: RiskCalculations;
  simulations: SimulationResult[];
  riskLevel: RiskLevel;
  recommendations: string[];
}
