import {TradingValidation} from '../../domain/rules/TradingValidation';
import {TradingPlanRepository} from '../../infrastructure/api/TradingPlanRepository';
import {CreateTradingPlanRequest, CreateTradingPlanResult} from '../dtos';

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
      return await this.tradingPlanRepository.create(request);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create trading plan'
      };
    }
  }
}
