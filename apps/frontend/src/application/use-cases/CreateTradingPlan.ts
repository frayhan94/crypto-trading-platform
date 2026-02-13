import { TradingPlan, PlanStatus } from '../../domain/models/TradingPlan';
import { TradingValidation } from '../../domain/rules/TradingValidation';
import { TradingPlanRepository } from '../../infrastructure/api/TradingPlanRepository';

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

export class CreateTradingPlanUseCase {
  constructor(private readonly tradingPlanRepository: TradingPlanRepository) {}

  async execute(request: CreateTradingPlanRequest): Promise<CreateTradingPlanResult> {
    try {
      // Validate plan name and description
      const nameErrors = TradingValidation.validatePlanName(request.name);
      const descriptionErrors = TradingValidation.validatePlanDescription(request.description || '');
      
      if (nameErrors.length > 0 || descriptionErrors.length > 0) {
        const allErrors = [...nameErrors, ...descriptionErrors];
        return {
          success: false,
          error: allErrors.map(error => `${error.field}: ${error.message}`).join(', ')
        };
      }

      // Create trading plan via repository
      const result = await this.tradingPlanRepository.create(request);

      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create trading plan'
      };
    }
  }
}
