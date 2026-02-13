import { PlanStatus } from '../../domain/entities/TradingPlan';

export interface UpdatePlanStatusDTO {
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
