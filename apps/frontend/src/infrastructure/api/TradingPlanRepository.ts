import { TradingPlan, PlanStatus } from '../../domain/models/TradingPlan';
import { HttpClient } from './HttpClient';
import { AuthenticatedHttpClient, getAuthenticatedClient } from './AuthenticatedHttpClient';
import {
  CreateTradingPlanRequest,
  CreateTradingPlanResponse,
  GetPlansResponse,
  UpdatePlanStatusResponse,
  ApiResponse,
} from '../../application/dtos';

export class TradingPlanRepository {
  constructor(private readonly httpClient: HttpClient | AuthenticatedHttpClient = getAuthenticatedClient()) {}

  async create(request: CreateTradingPlanRequest): Promise<CreateTradingPlanResponse> {
    return this.httpClient.post<CreateTradingPlanResponse['data']>('/api/v1/plans', request);
  }

  async getUserPlans(userId: string): Promise<GetPlansResponse> {
    return this.httpClient.get<TradingPlan[]>(`/api/v1/plans/user/${userId}`);
  }

  async getPlan(id: string): Promise<ApiResponse<TradingPlan>> {
    return this.httpClient.get<TradingPlan>(`/api/v1/plans/${id}`);
  }

  async updateStatus(id: string, status: PlanStatus): Promise<UpdatePlanStatusResponse> {
    return this.httpClient.patch<UpdatePlanStatusResponse['data']>(`/api/v1/plans/${id}`, { status });
  }

  async delete(id: string): Promise<ApiResponse<void>> {
    return this.httpClient.delete<void>(`/api/v1/plans/${id}`);
  }

  async getPlansByStatus(userId: string, status: PlanStatus): Promise<GetPlansResponse> {
    return this.httpClient.get<TradingPlan[]>(`/api/v1/plans/user/${userId}/status/${status}`);
  }
}
