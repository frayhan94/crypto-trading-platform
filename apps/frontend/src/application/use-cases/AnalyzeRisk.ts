import { TradingParameters } from '../../domain/models/TradingPlan';
import { RiskCalculation } from '../../domain/utils/RiskCalculation';
import { TradingValidation } from '../../domain/rules/TradingValidation';
import { AnalyzeRiskResult } from '../dtos';

export class AnalyzeRiskUseCase {
  execute(params: TradingParameters): AnalyzeRiskResult {
    try {
      // Validate parameters
      const validationErrors = TradingValidation.validateTradingParameters(params);
      if (validationErrors.length > 0) {
        return {
          success: false,
          errors: validationErrors.map(error => `${error.field}: ${error.message}`)
        };
      }

      // Perform risk analysis
      const analysis = RiskCalculation.analyzeRisk(params);

      return {
        success: true,
        data: {
          parameters: params,
          ...analysis
        }
      };
    } catch (error) {
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown error occurred']
      };
    }
  }
}
