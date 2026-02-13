import { TradingPlan, PlanStatus } from '../../domain/entities/TradingPlan';
import { TradingPlanRepository } from '../../domain/repositories/TradingPlanRepository';
import { UpdatePlanStatusDTO, UpdatePlanStatusResponse } from '../dtos/UpdatePlanStatusDTO';

export class UpdatePlanStatusUseCase {
  constructor(private readonly tradingPlanRepository: TradingPlanRepository) {}

  async execute(id: string, dto: UpdatePlanStatusDTO): Promise<UpdatePlanStatusResponse> {
    try {
      if (!id || id.trim() === '') {
        return {
          success: false,
          error: 'Plan ID is required'
        };
      }

      // Find existing plan
      const existingPlan = await this.tradingPlanRepository.findById(id);
      if (!existingPlan) {
        return {
          success: false,
          error: 'Trading plan not found'
        };
      }

      // Update status based on the requested change
      let updatedPlan: TradingPlan;
      
      switch (dto.status) {
        case PlanStatus.ACTIVE:
          updatedPlan = existingPlan.activate();
          break;
        case PlanStatus.EXECUTED:
          updatedPlan = existingPlan.execute();
          break;
        case PlanStatus.CANCELLED:
          updatedPlan = existingPlan.cancel();
          break;
        default:
          return {
            success: false,
            error: 'Invalid status transition'
          };
      }

      // Save updated plan
      const savedPlan = await this.tradingPlanRepository.update(updatedPlan);

      return {
        success: true,
        data: {
          id: savedPlan.id,
          status: savedPlan.status,
          updatedAt: savedPlan.updatedAt,
          executedAt: savedPlan.executedAt,
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update plan status'
      };
    }
  }
}
