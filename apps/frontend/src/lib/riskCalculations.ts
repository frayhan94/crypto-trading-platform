import type { TradingParameters, RiskCalculations, SimulationResult, RiskAnalysis } from '@repo/types';

export function calculateLiquidationPrice(
  entryPrice: number,
  leverage: number,
  isLong: boolean = true
): number {
  // Simplified liquidation price calculation
  // In reality, this would depend on exchange-specific formulas and fees
  const maintenanceMarginRate = 0.005; // 0.5% typical maintenance margin
  const liquidationThreshold = 1 - maintenanceMarginRate;

  if (isLong) {
    return entryPrice * (1 - (1 / leverage) * liquidationThreshold);
  } else {
    return entryPrice * (1 + (1 / leverage) * liquidationThreshold);
  }
}

export function calculateRiskMetrics(params: TradingParameters): RiskCalculations {
  const { balance, leverage, entryPrice, stopLoss, takeProfit, riskPercentage = 1 } = params;

  // Determine position direction
  const isLong = takeProfit > entryPrice;

  // Calculate liquidation price
  const liquidationPrice = calculateLiquidationPrice(entryPrice, leverage, isLong);

  // Calculate position size based on risk percentage
  const riskAmount = balance * (riskPercentage / 100);
  const stopLossDistance = Math.abs(entryPrice - stopLoss);
  const recommendedPositionSize = riskAmount / stopLossDistance;

  // Calculate margin required
  const positionValue = recommendedPositionSize * entryPrice;
  const marginRequired = positionValue / leverage;

  // Calculate potential P&L
  const takeProfitDistance = Math.abs(takeProfit - entryPrice);
  const potentialProfit = recommendedPositionSize * takeProfitDistance;
  const potentialLoss = recommendedPositionSize * stopLossDistance;

  // Calculate max loss percentage
  const maxLossPercentage = (potentialLoss / balance) * 100;

  // Calculate risk/reward ratio
  const riskRewardRatio = potentialProfit / potentialLoss;

  // Calculate distance to liquidation
  const distanceToLiquidation = Math.abs(entryPrice - liquidationPrice);

  return {
    liquidationPrice,
    maxLossPercentage,
    riskRewardRatio,
    recommendedPositionSize,
    potentialProfit,
    potentialLoss,
    marginRequired,
    distanceToLiquidation
  };
}

export function runSimulations(params: TradingParameters, calculations: RiskCalculations): SimulationResult[] {
  const { balance, stopLoss, takeProfit } = params;
  const { potentialProfit, potentialLoss } = calculations;

  const simulations: SimulationResult[] = [];

  // Helper function to format currency
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

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
  const liquidationLoss = balance * 0.9; // Assume 90% loss on liquidation
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

export function assessRiskLevel(calculations: RiskCalculations): 'low' | 'medium' | 'high' | 'extreme' {
  const { maxLossPercentage, riskRewardRatio } = calculations;

  if (maxLossPercentage > 10 || riskRewardRatio < 0.5) {
    return 'extreme';
  } else if (maxLossPercentage > 5 || riskRewardRatio < 1) {
    return 'high';
  } else if (maxLossPercentage > 2 || riskRewardRatio < 1.5) {
    return 'medium';
  } else {
    return 'low';
  }
}

export function generateRecommendations(
  params: TradingParameters,
  calculations: RiskCalculations,
  riskLevel: string
): string[] {
  const recommendations: string[] = [];
  const { maxLossPercentage, riskRewardRatio, marginRequired, distanceToLiquidation } = calculations;
  const { balance } = params;

  if (maxLossPercentage > 2) {
    recommendations.push(`Consider reducing position size to limit max loss to 2% of balance ($${(balance * 0.02).toFixed(2)})`);
  }

  if (riskRewardRatio < 1.5) {
    recommendations.push('Risk/Reward ratio is below 1.5:1. Consider adjusting take profit or stop loss');
  }

  if (marginRequired > balance * 0.5) {
    recommendations.push('High margin usage. Consider reducing leverage or position size');
  }

  if (distanceToLiquidation < Math.abs(params.entryPrice - params.stopLoss) * 2) {
    recommendations.push('Liquidation price is too close to entry. Consider reducing leverage');
  }

  if (riskLevel === 'extreme') {
    recommendations.push('⚠️ EXTREME RISK: This trade has very high risk parameters');
  }

  if (recommendations.length === 0) {
    recommendations.push('✅ Risk parameters look reasonable for this trade setup');
  }

  return recommendations;
}

export function analyzeRisk(params: TradingParameters): RiskAnalysis {
  const calculations = calculateRiskMetrics(params);
  const simulations = runSimulations(params, calculations);
  const riskLevel = assessRiskLevel(calculations);
  const recommendations = generateRecommendations(params, calculations, riskLevel);

  return {
    parameters: params,
    calculations,
    simulations,
    riskLevel,
    recommendations
  };
}

// Formatting utilities
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

export function formatPercentage(value: number): string {
  return `${(value * 100).toFixed(2)}%`;
}

// Re-export RiskAnalysis for convenience
export type { RiskAnalysis } from '@repo/types';
