import { TradingPlan, PlanStatus, PositionType, RiskLevel } from '../../domain/models/TradingPlan';
import { TradingPlanRepository } from '../../infrastructure/api/TradingPlanRepository';

export interface GetPlansResult {
  success: boolean;
  data?: TradingPlan[];
  error?: string;
}

export interface UpdatePlanResult {
  success: boolean;
  data?: TradingPlan;
  error?: string;
}

export interface DeletePlanResult {
  success: boolean;
  error?: string;
}

export class TradingPlanService {
  constructor(private readonly repository: TradingPlanRepository) {}

  async getUserPlans(userId: string): Promise<GetPlansResult> {
    try {
      if (!userId || userId.trim() === '') {
        return {
          success: false,
          error: 'User ID is required'
        };
      }

      const result = await this.repository.getUserPlans(userId);
      
      return {
        success: result.success,
        data: result.data,
        error: result.error
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch plans'
      };
    }
  }

  async getPlansByStatus(userId: string, status: PlanStatus): Promise<GetPlansResult> {
    try {
      if (!userId || userId.trim() === '') {
        return {
          success: false,
          error: 'User ID is required'
        };
      }

      const result = await this.repository.getPlansByStatus(userId, status);
      
      return {
        success: result.success,
        data: result.data,
        error: result.error
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch plans'
      };
    }
  }

  async getPlan(id: string): Promise<UpdatePlanResult> {
    try {
      if (!id || id.trim() === '') {
        return {
          success: false,
          error: 'Plan ID is required'
        };
      }

      const result = await this.repository.getPlan(id);
      
      return {
        success: result.success,
        data: result.data,
        error: result.error
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch plan'
      };
    }
  }

  async updatePlanStatus(id: string, status: PlanStatus): Promise<UpdatePlanResult> {
    try {
      if (!id || id.trim() === '') {
        return {
          success: false,
          error: 'Plan ID is required'
        };
      }

      const result = await this.repository.updateStatus(id, status);
      
      return {
        success: result.success,
        data: result.data ? {
          id: result.data.id,
          userId: '', // Would be populated from backend
          name: '', // Would be populated from backend
          description: null,
          status: result.data.status,
          entryPrice: 0,
          stopLoss: 0,
          takeProfit: 0,
          leverage: 0,
          positionType: PositionType.LONG,
          riskPercentage: 0,
          accountBalance: 0,
          liquidationPrice: 0,
          positionSize: 0,
          marginRequired: 0,
          orderValue: 0,
          potentialProfit: 0,
          potentialLoss: 0,
          riskRewardRatio: 0,
          maxLossPercentage: 0,
          riskLevel: RiskLevel.LOW,
          recommendations: [],
          createdAt: new Date(),
          updatedAt: result.data.updatedAt,
          executedAt: result.data.executedAt || null,
        } : undefined,
        error: result.error
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update plan'
      };
    }
  }

  async deletePlan(id: string): Promise<DeletePlanResult> {
    try {
      if (!id || id.trim() === '') {
        return {
          success: false,
          error: 'Plan ID is required'
        };
      }

      const result = await this.repository.delete(id);
      
      return {
        success: result.success,
        error: result.error
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete plan'
      };
    }
  }
}
