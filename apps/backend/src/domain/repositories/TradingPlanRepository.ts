import { TradingPlan, PlanStatus } from '../entities/TradingPlan.js';

export interface TradingPlanRepository {
  create(plan: TradingPlan): Promise<TradingPlan>;
  findById(id: string): Promise<TradingPlan | null>;
  findByUserId(userId: string): Promise<TradingPlan[]>;
  findByUserIdAndStatus(userId: string, status: PlanStatus): Promise<TradingPlan[]>;
  update(plan: TradingPlan): Promise<TradingPlan>;
  delete(id: string): Promise<void>;
}
