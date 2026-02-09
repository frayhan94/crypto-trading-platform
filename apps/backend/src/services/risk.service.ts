// Local type definitions for Vercel deployment
interface TradingParams {
  entryPrice: number;
  stopLoss: number;
  takeProfit: number;
  balance: number;
  accountBalance: number;
  leverage: number;
  riskPercentage: number;
  positionType: 'long' | 'short';
}

interface RiskCalculations {
  liquidationPrice: number;
  recommendedPositionSize: number;
  positionSize?: number;
  marginRequired: number;
  orderValue?: number;
  potentialProfit: number;
  potentialLoss: number;
  riskRewardRatio: number;
  maxLossPercentage: number;
  distanceToLiquidation: number;
}

interface SimulationResult {
  scenario: string;
  resultBalance: number;
  pnl: number;
  pnlPercentage: number;
  description: string;
}

type RiskLevel = 'low' | 'medium' | 'high' | 'extreme';

export class RiskService {
  static calculateLiquidationPrice(
    entryPrice: number,
    leverage: number,
    isLong: boolean = true
  ): number {
    const maintenanceMarginRate = 0.005;
    const liquidationThreshold = 1 - maintenanceMarginRate;

    if (isLong) {
      return entryPrice * (1 - (1 / leverage) * liquidationThreshold);
    } else {
      return entryPrice * (1 + (1 / leverage) * liquidationThreshold);
    }
  }

  static calculatePositionSize(
    balance: number,
    riskPercentage: number,
    entryPrice: number,
    stopLoss: number
  ): number {
    const riskAmount = balance * (riskPercentage / 100);
    const stopLossDistance = Math.abs(entryPrice - stopLoss);
    return riskAmount / stopLossDistance;
  }

  static analyzeRisk(params: TradingParams) {
    const { balance, leverage, entryPrice, stopLoss, takeProfit, riskPercentage } = params;
    const isLong = params.positionType === 'long';

    // Calculate liquidation price
    const liquidationPrice = this.calculateLiquidationPrice(entryPrice, leverage, isLong);

    // Calculate position size
    const riskAmount = balance * (riskPercentage / 100);
    const stopLossDistance = Math.abs(entryPrice - stopLoss);
    const positionSize = riskAmount / stopLossDistance;

    // Calculate margin and order value
    const positionValue = positionSize * entryPrice;
    const marginRequired = positionValue / leverage;
    const orderValue = marginRequired * leverage;

    // Calculate potential P&L
    const takeProfitDistance = Math.abs(takeProfit - entryPrice);
    const potentialProfit = positionSize * takeProfitDistance;
    const potentialLoss = positionSize * stopLossDistance;

    // Risk metrics
    const riskRewardRatio = potentialProfit / potentialLoss;
    const maxLossPercentage = (potentialLoss / balance) * 100;
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
    const simulations = this.runSimulations(params, calculations);

    // Risk level assessment
    const riskLevel = this.assessRiskLevel(calculations);

    // Recommendations
    const recommendations = this.generateRecommendations(calculations, riskLevel);

    return {
      parameters: params,
      calculations,
      simulations,
      riskLevel,
      recommendations,
      timestamp: new Date().toISOString(),
    };
  }

  private static runSimulations(params: TradingParams, calculations: RiskCalculations): SimulationResult[] {
    const { balance, stopLoss, takeProfit } = params;
    const { potentialProfit, potentialLoss } = calculations;

    const formatCurrency = (value: number): string => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(value);
    };

    const simulations: SimulationResult[] = [];

    // Scenario 1: Stop Loss Hit
    const stopLossBalance = balance - potentialLoss;
    simulations.push({
      scenario: 'stopLossHit',
      resultBalance: stopLossBalance,
      pnl: -potentialLoss,
      pnlPercentage: -(potentialLoss / balance) * 100,
      description: `Stop loss hit at ${formatCurrency(stopLoss)}`
    });

    // Scenario 2: Take Profit Hit
    const takeProfitBalance = balance + potentialProfit;
    simulations.push({
      scenario: 'takeProfitHit',
      resultBalance: takeProfitBalance,
      pnl: potentialProfit,
      pnlPercentage: (potentialProfit / balance) * 100,
      description: `Take profit hit at ${formatCurrency(takeProfit)}`
    });

    // Scenario 3: Liquidation
    const liquidationLoss = balance * 0.9;
    const liquidationBalance = balance - liquidationLoss;
    simulations.push({
      scenario: 'liquidation',
      resultBalance: liquidationBalance,
      pnl: -liquidationLoss,
      pnlPercentage: -90,
      description: `Position liquidated - catastrophic loss of ${formatCurrency(liquidationLoss)}`
    });

    return simulations;
  }

  private static assessRiskLevel(calculations: RiskCalculations): RiskLevel {
    const { maxLossPercentage, riskRewardRatio } = calculations;

    if (maxLossPercentage > 10 || riskRewardRatio < 0.5) {
      return 'extreme';
    }
    if (maxLossPercentage > 5 || riskRewardRatio < 1) {
      return 'high';
    }
    if (maxLossPercentage > 2 || riskRewardRatio < 1.5) {
      return 'medium';
    }
    return 'low';
  }

  private static generateRecommendations(
    calculations: RiskCalculations,
    riskLevel: string
  ): string[] {
    const recommendations: string[] = [];

    if (riskLevel === 'extreme') {
      recommendations.push('Consider reducing position size significantly');
      recommendations.push('Your risk-reward ratio is unfavorable');
    }

    if (riskLevel === 'high') {
      recommendations.push('Consider using a tighter stop loss');
      recommendations.push('Reduce leverage to lower liquidation risk');
    }

    if (calculations.riskRewardRatio < 1.5) {
      recommendations.push('Aim for at least 1.5:1 risk-reward ratio');
    }

    if (calculations.maxLossPercentage > 2) {
      recommendations.push('Professional traders risk 1-2% per trade');
    }

    if (recommendations.length === 0) {
      recommendations.push('Your risk parameters look reasonable');
      recommendations.push('Always use stop losses to protect capital');
    }

    return recommendations;
  }

  static getRecommendations() {
    return {
      riskManagement: [
        { title: 'Position Sizing', description: 'Never risk more than 1-2% of your account on a single trade' },
        { title: 'Stop Loss', description: 'Always use a stop loss to limit potential losses' },
        { title: 'Risk-Reward', description: 'Aim for at least 1.5:1 to 2:1 risk-reward ratio' },
        { title: 'Leverage', description: 'Lower leverage reduces liquidation risk' },
        { title: 'Diversification', description: 'Spread risk across multiple positions' },
        { title: 'Emotional Control', description: 'Stick to your trading plan regardless of emotions' },
      ],
    };
  }
}
