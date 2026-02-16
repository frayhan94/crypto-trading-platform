import { PlanStatus } from '../../domain/models/TradingPlan';

/**
 * Request DTO for creating a new trading plan
 */
export interface CreateTradingPlanRequest {
  userId: string;
  name: string;
  description?: string;
  entryPrice: number;
  stopLoss: number;
  takeProfit: number;
  leverage: number;
  positionType: 'LONG' | 'SHORT';
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
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';
  recommendations: string[];
}

/**
 * Response DTO for creating a trading plan
 */
export interface CreateTradingPlanResponse {
  success: boolean;
  data?: {
    id: string;
    name: string;
    status: PlanStatus;
    createdAt: Date;
  };
  error?: string;
}

/**
 * Result DTO for create trading plan use case
 */
export interface CreateTradingPlanResult {
  success: boolean;
  data?: {
    id: string;
    name: string;
    status: PlanStatus;
    createdAt: Date;
  };
  error?: string;
}

/**
 * Request DTO for updating plan status
 */
export interface UpdatePlanStatusRequest {
  status: PlanStatus;
}

/**
 * Response DTO for updating plan status
 */
export interface UpdatePlanStatusResponse {
  success: boolean;
  data?: {
    id: string;
    status: PlanStatus;
    updatedAt: Date;
    executedAt?: Date | null;
  };
  error?: string;
}

/**
 * Result DTO for getting plans
 */
export interface GetPlansResult {
  success: boolean;
  data?: import('../../domain/models/TradingPlan').TradingPlan[];
  error?: string;
}

/**
 * Response DTO for getting plans from API
 */
export interface GetPlansResponse {
  success: boolean;
  data?: import('../../domain/models/TradingPlan').TradingPlan[];
  error?: string;
}

/**
 * Result DTO for updating a plan
 */
export interface UpdatePlanResult {
  success: boolean;
  data?: import('../../domain/models/TradingPlan').TradingPlan;
  error?: string;
}

/**
 * Result DTO for deleting a plan
 */
export interface DeletePlanResult {
  success: boolean;
  error?: string;
}

/**
 * Result DTO for analyzing risk
 */
export interface AnalyzeRiskResult {
  success: boolean;
  data?: import('../../domain/models/TradingPlan').RiskAnalysis;
  errors?: string[];
}
