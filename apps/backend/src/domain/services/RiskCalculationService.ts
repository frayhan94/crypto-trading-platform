import { Money } from '../value-objects/Money.js';
import { Percentage } from '../value-objects/Percentage.js';
import { RiskLevel } from '../entities/TradingPlan.js';

export interface TradingParameters {
  entryPrice: number;
  stopLoss: number;
  takeProfit: number;
  leverage: number;
  positionType: 'LONG' | 'SHORT';
  riskPercentage: number;
  accountBalance: number;
}

export interface RiskCalculations {
  liquidationPrice: number;
  recommendedPositionSize: number;
  positionSize: number;
  marginRequired: number;
  orderValue: number;
  potentialProfit: number;
  potentialLoss: number;
  riskRewardRatio: number;
  maxLossPercentage: number;
  distanceToLiquidation: number;
}

export interface SimulationResult {
  scenario: string;
  resultBalance: number;
  pnl: number;
  pnlPercentage: number;
  description: string;
}

export class RiskCalculationService {
  private static readonly MAINTENANCE_MARGIN_RATE = 0.005;

  static calculateLiquidationPrice(
    entryPrice: number,
    leverage: number,
    positionType: 'LONG' | 'SHORT'
  ): number {
    const liquidationThreshold = 1 - this.MAINTENANCE_MARGIN_RATE;

    if (positionType === 'LONG') {
      return entryPrice * (1 - (1 / leverage) * liquidationThreshold);
    } else {
      return entryPrice * (1 + (1 / leverage) * liquidationThreshold);
    }
  }

  static calculatePositionSize(
    accountBalance: number,
    riskPercentage: number,
    entryPrice: number,
    stopLoss: number
  ): number {
    const riskAmount = accountBalance * (riskPercentage / 100);
    const stopLossDistance = Math.abs(entryPrice - stopLoss);
    return riskAmount / stopLossDistance;
  }

  static analyzeRisk(params: TradingParameters): {
    calculations: RiskCalculations;
    simulations: SimulationResult[];
    riskLevel: RiskLevel;
    recommendations: string[];
  } {
    const {
      entryPrice,
      stopLoss,
      takeProfit,
      leverage,
      positionType,
      riskPercentage,
      accountBalance
    } = params;

    // Calculate liquidation price
    const liquidationPrice = this.calculateLiquidationPrice(entryPrice, leverage, positionType);

    // Calculate position size
    const positionSize = this.calculatePositionSize(accountBalance, riskPercentage, entryPrice, stopLoss);

    // Calculate other metrics
    const positionValue = positionSize * entryPrice;
    const marginRequired = positionValue / leverage;
    const orderValue = marginRequired * leverage;
    const takeProfitDistance = Math.abs(takeProfit - entryPrice);
    const potentialProfit = positionSize * takeProfitDistance;
    const potentialLoss = positionSize * Math.abs(entryPrice - stopLoss);
    const riskRewardRatio = potentialProfit / potentialLoss;
    const maxLossPercentage = (potentialLoss / accountBalance) * 100;
    const distanceToLiquidation = Math.abs(entryPrice - liquidationPrice);

    const calculations: RiskCalculations = {
      liquidationPrice,
      recommendedPositionSize: positionSize,
      positionSize,
      marginRequired,
      orderValue,
      potentialProfit,
      potentialLoss,
      riskRewardRatio,
      maxLossPercentage,
      distanceToLiquidation,
    };

    // Simulations
    const simulations = [
      {
        scenario: 'stopLossHit',
        resultBalance: accountBalance - potentialLoss,
        pnl: -potentialLoss,
        pnlPercentage: -(potentialLoss / accountBalance) * 100,
        description: `Stop loss hit at ${Money.create(stopLoss).toFormattedString()}`
      },
      {
        scenario: 'takeProfitHit',
        resultBalance: accountBalance + potentialProfit,
        pnl: potentialProfit,
        pnlPercentage: (potentialProfit / accountBalance) * 100,
        description: `Take profit hit at ${Money.create(takeProfit).toFormattedString()}`
      },
      {
        scenario: 'liquidation',
        resultBalance: accountBalance * 0.1,
        pnl: -(accountBalance * 0.9),
        pnlPercentage: -90,
        description: `Position liquidated - catastrophic loss of ${Money.create(accountBalance * 0.9).toFormattedString()}`
      }
    ];

    // Risk level assessment
    let riskLevel: RiskLevel = RiskLevel.LOW;
    if (maxLossPercentage > 10 || riskRewardRatio < 0.5) riskLevel = RiskLevel.EXTREME;
    else if (maxLossPercentage > 5 || riskRewardRatio < 1) riskLevel = RiskLevel.HIGH;
    else if (maxLossPercentage > 2 || riskRewardRatio < 1.5) riskLevel = RiskLevel.MEDIUM;

    // Recommendations
    const recommendations: string[] = [];
    if (riskLevel === RiskLevel.EXTREME) {
      recommendations.push('Consider reducing position size significantly');
      recommendations.push('Your risk-reward ratio is unfavorable');
    }
    if (riskLevel === RiskLevel.HIGH) {
      recommendations.push('Consider using a tighter stop loss');
      recommendations.push('Reduce leverage to lower liquidation risk');
    }
    if (riskRewardRatio < 1.5) recommendations.push('Aim for at least 1.5:1 risk-reward ratio');
    if (maxLossPercentage > 2) recommendations.push('Professional traders risk 1-2% per trade');
    if (recommendations.length === 0) {
      recommendations.push('Your risk parameters look reasonable');
      recommendations.push('Always use stop losses to protect capital');
    }

    return {
      calculations,
      simulations,
      riskLevel,
      recommendations
    };
  }

  static validateTradingParameters(params: TradingParameters): string[] {
    const errors: string[] = [];

    if (params.entryPrice <= 0) {
      errors.push('Entry price must be greater than 0');
    }
    if (params.stopLoss <= 0) {
      errors.push('Stop loss must be greater than 0');
    }
    if (params.takeProfit <= 0) {
      errors.push('Take profit must be greater than 0');
    }
    if (params.accountBalance <= 0) {
      errors.push('Account balance must be greater than 0');
    }
    if (params.riskPercentage <= 0 || params.riskPercentage > 100) {
      errors.push('Risk percentage must be between 0 and 100');
    }
    if (params.leverage <= 0 || params.leverage > 125) {
      errors.push('Leverage must be between 1 and 125');
    }

    // Validate stop loss and take profit positions
    if (params.positionType === 'LONG') {
      if (params.stopLoss >= params.entryPrice) {
        errors.push('For long positions, stop loss must be below entry price');
      }
      if (params.takeProfit <= params.entryPrice) {
        errors.push('For long positions, take profit must be above entry price');
      }
    } else {
      if (params.stopLoss <= params.entryPrice) {
        errors.push('For short positions, stop loss must be above entry price');
      }
      if (params.takeProfit >= params.entryPrice) {
        errors.push('For short positions, take profit must be below entry price');
      }
    }

    return errors;
  }
}
