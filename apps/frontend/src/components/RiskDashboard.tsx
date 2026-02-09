'use client';

import type { RiskAnalysis } from '@repo/types';

interface RiskDashboardProps {
  analysis: RiskAnalysis | null;
}

export default function RiskDashboard({ analysis }: RiskDashboardProps) {
  if (!analysis) {
    return (
      <div className="bg-white border border-gray-300 p-8">
        <div className="text-center text-gray-500 py-12">
          <p className="text-lg font-light tracking-wide">ENTER TRADING PARAMETERS</p>
          <p className="text-lg font-light tracking-wide">TO ANALYZE RISK</p>
        </div>
      </div>
    );
  }

  const { calculations, simulations, riskLevel, recommendations, parameters } = analysis;

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-50 text-green-800 border border-green-200';
      case 'medium': return 'bg-yellow-50 text-yellow-800 border border-yellow-200';
      case 'high': return 'bg-orange-50 text-orange-800 border border-orange-200';
      case 'extreme': return 'bg-red-50 text-red-800 border border-red-200';
      default: return 'bg-gray-50 text-gray-800 border border-gray-200';
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  return (
    <div className="space-y-8">
      {/* Risk Level Alert */}
      <div className={`p-6 border ${getRiskLevelColor(riskLevel)}`}>
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-black tracking-tight">RISK LEVEL</h3>
          <span className={`px-4 py-2 text-sm font-black tracking-wider border ${getRiskLevelColor(riskLevel)}`}>
            {riskLevel.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="bg-white border border-gray-300 p-8">
        <h3 className="text-2xl font-black tracking-tight mb-8">
          RISK <span className="text-gray-500">METRICS</span>
        </h3>
        <div className="w-16 h-0.5 bg-black mb-8"></div>

        {/* Isolated Mode Notice */}
        <div className="bg-blue-50 border border-blue-200 p-4 mb-8">
          <div className="flex items-start space-x-3">
            <div className="text-blue-600 text-lg">ℹ️</div>
            <div>
              <p className="text-sm font-black text-blue-800 tracking-wide mb-1">
                ISOLATED MODE CALCULATIONS
              </p>
              <p className="text-xs text-blue-700 font-light leading-relaxed">
                All risk calculations are based on isolated margin mode. Cross-margin calculations may vary 
                depending on exchange-specific formulas and portfolio composition.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-gray-50 border border-gray-200 p-6">
            <p className="text-sm font-black tracking-wide text-gray-600 mb-3">LIQUIDATION PRICE</p>
            <p className="text-2xl font-black text-red-600">
              {formatCurrency(calculations.liquidationPrice)}
            </p>
            <p className="text-xs text-gray-500 mt-2 font-light">
              {formatPercentage(calculations.distanceToLiquidation / parameters.entryPrice * 100)} FROM ENTRY
            </p>
          </div>

          <div className="bg-gray-50 border border-gray-200 p-6">
            <p className="text-sm font-black tracking-wide text-gray-600 mb-3">MAX LOSS</p>
            <p className="text-2xl font-black text-orange-600">
              {formatCurrency(calculations.potentialLoss)}
            </p>
            <p className="text-xs text-gray-500 mt-2 font-light">
              {formatPercentage(calculations.maxLossPercentage)} OF BALANCE
            </p>
          </div>

          <div className="bg-gray-50 border border-gray-200 p-6">
            <p className="text-sm font-black tracking-wide text-gray-600 mb-3">RISK/REWARD RATIO</p>
            <p className="text-2xl font-black text-blue-600">
              {calculations.riskRewardRatio.toFixed(2)}:1
            </p>
            <p className="text-xs text-gray-500 mt-2 font-light">
              PROFIT: {formatCurrency(calculations.potentialProfit)}
            </p>
          </div>

          <div className="bg-gray-50 border border-gray-200 p-6">
            <p className="text-sm font-black tracking-wide text-gray-600 mb-3">POSITION SIZE</p>
            <p className="text-2xl font-black text-purple-600">
              {calculations.recommendedPositionSize.toFixed(4)}
            </p>
            <p className="text-xs text-gray-500 mt-2 font-light">
              UNITS
            </p>
          </div>

          <div className="bg-gray-50 border border-gray-200 p-6">
            <p className="text-sm font-black tracking-wide text-gray-600 mb-3">MARGIN REQUIRED</p>
            <p className="text-2xl font-black text-indigo-600">
              {formatCurrency(calculations.marginRequired)}
            </p>
            <p className="text-xs text-gray-500 mt-2 font-light">
              {formatPercentage(calculations.marginRequired / parameters.balance * 100)} OF BALANCE
            </p>
          </div>

          <div className="bg-gray-50 border border-gray-200 p-6">
            <p className="text-sm font-black tracking-wide text-gray-600 mb-3">ORDER VALUE</p>
            <p className="text-2xl font-black text-teal-600">
              {formatCurrency(calculations.marginRequired * parameters.leverage)}
            </p>
            <p className="text-xs text-gray-500 mt-2 font-light">
              LEVERAGE: {parameters.leverage}x
            </p>
          </div>

          <div className="bg-gray-50 border border-gray-200 p-6">
            <p className="text-sm font-black tracking-wide text-gray-600 mb-3">POTENTIAL PROFIT</p>
            <p className="text-2xl font-black text-green-600">
              {formatCurrency(calculations.potentialProfit)}
            </p>
            <p className="text-xs text-gray-500 mt-2 font-light">
              {formatPercentage(calculations.potentialProfit / parameters.balance * 100)} RETURN
            </p>
          </div>
        </div>
      </div>

      {/* Simulations */}
      <div className="bg-white border border-gray-300 p-8">
        <h3 className="text-2xl font-black tracking-tight mb-8">
          SCENARIO <span className="text-gray-500">ANALYSIS</span>
        </h3>
        <div className="w-16 h-0.5 bg-black mb-8"></div>

        <div className="space-y-4">
          {simulations.map((simulation) => (
            <div key={simulation.scenario} className="bg-gray-50 border border-gray-200 p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-black text-black tracking-tight">{simulation.description}</h4>
                  <p className="text-sm text-gray-600 mt-2 font-light">
                    FINAL BALANCE: {formatCurrency(simulation.resultBalance)}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`font-black text-lg ${
                    simulation.pnl >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatCurrency(simulation.pnl)}
                  </p>
                  <p className={`text-sm font-light ${
                    simulation.pnlPercentage >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatPercentage(simulation.pnlPercentage)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-white border border-gray-300 p-8">
        <h3 className="text-2xl font-black tracking-tight mb-8">
          RECOMMEND <span className="text-gray-500">ACTIONS</span>
        </h3>
        <div className="w-16 h-0.5 bg-black mb-8"></div>

        <div className="space-y-3">
          {recommendations.map((recommendation, index) => (
            <div key={index} className="flex items-start space-x-3">
              <span className="text-black text-xl">•</span>
              <p className="text-gray-700 font-light">{recommendation}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
