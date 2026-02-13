import { TradingParameters } from '../models/TradingPlan';

export interface ValidationError {
  field: string;
  message: string;
}

export class TradingValidation {
  static validateTradingParameters(params: TradingParameters): ValidationError[] {
    const errors: ValidationError[] = [];

    if (params.entryPrice <= 0) {
      errors.push({ field: 'entryPrice', message: 'Entry price must be greater than 0' });
    }
    if (params.stopLoss <= 0) {
      errors.push({ field: 'stopLoss', message: 'Stop loss must be greater than 0' });
    }
    if (params.takeProfit <= 0) {
      errors.push({ field: 'takeProfit', message: 'Take profit must be greater than 0' });
    }
    if (params.accountBalance <= 0) {
      errors.push({ field: 'accountBalance', message: 'Account balance must be greater than 0' });
    }
    if (params.riskPercentage <= 0 || params.riskPercentage > 100) {
      errors.push({ field: 'riskPercentage', message: 'Risk percentage must be between 0 and 100' });
    }
    if (params.leverage <= 0 || params.leverage > 125) {
      errors.push({ field: 'leverage', message: 'Leverage must be between 1 and 125' });
    }

    // Validate stop loss and take profit positions
    if (params.positionType === 'LONG') {
      if (params.stopLoss >= params.entryPrice) {
        errors.push({ field: 'stopLoss', message: 'For long positions, stop loss must be below entry price' });
      }
      if (params.takeProfit <= params.entryPrice) {
        errors.push({ field: 'takeProfit', message: 'For long positions, take profit must be above entry price' });
      }
    } else {
      if (params.stopLoss <= params.entryPrice) {
        errors.push({ field: 'stopLoss', message: 'For short positions, stop loss must be above entry price' });
      }
      if (params.takeProfit >= params.entryPrice) {
        errors.push({ field: 'takeProfit', message: 'For short positions, take profit must be below entry price' });
      }
    }

    return errors;
  }

  static validatePlanName(name: string): ValidationError[] {
    const errors: ValidationError[] = [];

    if (!name || name.trim().length === 0) {
      errors.push({ field: 'name', message: 'Plan name is required' });
    }
    if (name.length > 100) {
      errors.push({ field: 'name', message: 'Plan name must be less than 100 characters' });
    }

    return errors;
  }

  static validatePlanDescription(description: string): ValidationError[] {
    const errors: ValidationError[] = [];

    if (description && description.length > 500) {
      errors.push({ field: 'description', message: 'Description must be less than 500 characters' });
    }

    return errors;
  }
}
