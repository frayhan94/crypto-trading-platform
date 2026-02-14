import { TradingPlan } from '../../domain/entities/TradingPlan.js';
import { TradingPlanRepository } from '../../domain/repositories/TradingPlanRepository.js';

export interface GetUserPlansResponse {
  success: boolean;
  data?: TradingPlan[];
  error?: string;
}

export class GetUserPlansUseCase {
  constructor(private readonly tradingPlanRepository: TradingPlanRepository) {}

  async execute(userId: string): Promise<GetUserPlansResponse> {
    try {
      if (!userId || userId.trim() === '') {
        return {
          success: false,
          error: 'User ID is required'
        };
      }

      const plans = await this.tradingPlanRepository.findByUserId(userId);

      return {
        success: true,
        data: plans
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch user plans'
      };
    }
  }
}
