// Trading Types
export interface TradingParameters {
  entryPrice: number;
  stopLoss: number;
  takeProfit: number;
  balance: number;
  leverage: number;
  riskPercentage?: number;
}

export interface TradingParams extends TradingParameters {
  accountBalance: number;
  positionType: 'long' | 'short';
  riskPercentage: number;
}

// Risk Calculation Types
export interface RiskCalculations {
  liquidationPrice: number;
  recommendedPositionSize: number;
  positionSize?: number;
  marginRequired: number;
  orderValue?: number;
  potentialProfit: number;
  potentialLoss: number;
  riskRewardRatio: number;
  maxLossPercentage: number;
  distanceToLiquidation: number;
}

export type SimulationScenario = 'stopLossHit' | 'takeProfitHit' | 'liquidation';

export interface SimulationResult {
  scenario: SimulationScenario | string;
  resultBalance: number;
  pnl: number;
  pnlPercentage: number;
  description: string;
}

export type RiskLevel = 'low' | 'medium' | 'high' | 'extreme';

export interface RiskAnalysis {
  parameters: TradingParameters | TradingParams;
  calculations: RiskCalculations;
  simulations: SimulationResult[];
  riskLevel: RiskLevel;
  recommendations: string[];
  timestamp?: string | number;
}

// Validation Types
export interface ValidationError {
  field: keyof TradingParams;
  message: string;
  value: string | number | boolean | undefined;
}

// UI State Types
export interface AnalysisState {
  analysis: RiskAnalysis | null;
  isLoading: boolean;
  error: string | null;
  validations: ValidationError[];
}

export interface ErrorMessage {
  id: string;
  message: string;
  type: 'error' | 'warning' | 'info';
  timestamp: number;
  dismissible?: boolean;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface HealthResponse {
  status: string;
  timestamp: string;
  uptime?: number;
}
