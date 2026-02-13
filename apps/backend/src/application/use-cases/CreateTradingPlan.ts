import { TradingPlan } from '../../domain/entities/TradingPlan';
import { TradingPlanRepository } from '../../domain/repositories/TradingPlanRepository';
import { RiskCalculationService, TradingParameters } from '../../domain/services/RiskCalculationService';
import { CreateTradingPlanDTO, CreateTradingPlanResponse } from '../dtos/CreateTradingPlanDTO';

export class CreateTradingPlanUseCase {
  constructor(private readonly tradingPlanRepository: TradingPlanRepository) {}

  async execute(dto: CreateTradingPlanDTO): Promise<CreateTradingPlanResponse> {
    try {
      // Validate trading parameters
      const tradingParams: TradingParameters = {
        entryPrice: dto.entryPrice,
        stopLoss: dto.stopLoss,
        takeProfit: dto.takeProfit,
        leverage: dto.leverage,
        positionType: dto.positionType,
        riskPercentage: dto.riskPercentage,
        accountBalance: dto.accountBalance,
      };

      const validationErrors = RiskCalculationService.validateTradingParameters(tradingParams);
      if (validationErrors.length > 0) {
        return {
          success: false,
          error: `Validation errors: ${validationErrors.join(', ')}`
        };
      }

      // Generate unique ID
      const id = this.generateId();

      // Create trading plan entity
      const plan = TradingPlan.create({
        id,
        userId: dto.userId,
        name: dto.name,
        description: dto.description,
        entryPrice: dto.entryPrice,
        stopLoss: dto.stopLoss,
        takeProfit: dto.takeProfit,
        leverage: dto.leverage,
        positionType: dto.positionType,
        riskPercentage: dto.riskPercentage,
        accountBalance: dto.accountBalance,
        liquidationPrice: dto.liquidationPrice,
        positionSize: dto.positionSize,
        marginRequired: dto.marginRequired,
        orderValue: dto.orderValue,
        potentialProfit: dto.potentialProfit,
        potentialLoss: dto.potentialLoss,
        riskRewardRatio: dto.riskRewardRatio,
        maxLossPercentage: dto.maxLossPercentage,
        riskLevel: dto.riskLevel,
        recommendations: dto.recommendations,
      });

      // Save to repository
      const savedPlan = await this.tradingPlanRepository.create(plan);

      return {
        success: true,
        data: {
          id: savedPlan.id,
          name: savedPlan.name,
          status: savedPlan.status,
          createdAt: savedPlan.createdAt,
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create trading plan'
      };
    }
  }

  private generateId(): string {
    return `plan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
