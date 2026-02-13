import { TradingPlan, PlanStatus } from '../../domain/models/TradingPlan';
import { HttpClient, ApiResponse } from './HttpClient';

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

export interface GetPlansResponse {
  success: boolean;
  data?: TradingPlan[];
  error?: string;
}

export interface UpdatePlanStatusRequest {
  status: PlanStatus;
}

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

export class TradingPlanRepository {
  constructor(private readonly httpClient: HttpClient = new HttpClient()) {}

  async create(request: CreateTradingPlanRequest): Promise<CreateTradingPlanResponse> {
    return this.httpClient.post<CreateTradingPlanResponse['data']>('/api/plans', request);
  }

  async getUserPlans(userId: string): Promise<GetPlansResponse> {
    return this.httpClient.get<TradingPlan[]>(`/api/plans/user/${userId}`);
  }

  async getPlan(id: string): Promise<ApiResponse<TradingPlan>> {
    return this.httpClient.get<TradingPlan>(`/api/plans/${id}`);
  }

  async updateStatus(id: string, status: PlanStatus): Promise<UpdatePlanStatusResponse> {
    return this.httpClient.patch<UpdatePlanStatusResponse['data']>(`/api/plans/${id}`, { status });
  }

  async delete(id: string): Promise<ApiResponse<void>> {
    return this.httpClient.delete<void>(`/api/plans/${id}`);
  }

  async getPlansByStatus(userId: string, status: PlanStatus): Promise<GetPlansResponse> {
    return this.httpClient.get<TradingPlan[]>(`/api/plans/user/${userId}/status/${status}`);
  }
}
