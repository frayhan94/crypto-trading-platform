import { TradingParameters, RiskCalculations, SimulationResult, RiskLevel } from '../models/TradingPlan';

export class RiskCalculation {
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
        description: `Stop loss hit at $${stopLoss.toLocaleString()}`
      },
      {
        scenario: 'takeProfitHit',
        resultBalance: accountBalance + potentialProfit,
        pnl: potentialProfit,
        pnlPercentage: (potentialProfit / accountBalance) * 100,
        description: `Take profit hit at $${takeProfit.toLocaleString()}`
      },
      {
        scenario: 'liquidation',
        resultBalance: accountBalance * 0.1,
        pnl: -(accountBalance * 0.9),
        pnlPercentage: -90,
        description: `Position liquidated - catastrophic loss of $${(accountBalance * 0.9).toLocaleString()}`
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

  static formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  }

  static formatPercentage(value: number): string {
    return `${value.toFixed(2)}%`;
  }

  static getRiskLevelColor(riskLevel: RiskLevel): string {
    switch (riskLevel) {
      case RiskLevel.LOW:
        return 'text-green-600';
      case RiskLevel.MEDIUM:
        return 'text-yellow-600';
      case RiskLevel.HIGH:
        return 'text-orange-600';
      case RiskLevel.EXTREME:
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  }
}
