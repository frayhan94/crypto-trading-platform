'use client';

import { RiskAnalysis } from '../../domain/models/TradingPlan';
import { RiskCalculation } from '../../domain/utils/RiskCalculation';

interface RiskDashboardProps {
  analysis: RiskAnalysis | null;
}

export default function RiskDashboard({ analysis }: RiskDashboardProps) {
  if (!analysis) {
    return (
      <div className="bg-white border border-gray-300 p-8">
        <h2 className="text-2xl text-gray-500 tracking-tight mb-6">RISK ANALYSIS RESULTS</h2>
        <div className="text-center py-8">
          <div className="text-gray-500">Complete the form to see risk analysis results</div>
        </div>
      </div>
    );
  }

  const { calculations, simulations, riskLevel, recommendations } = analysis;

  return (
    <div className="bg-white border border-gray-300 p-8">
      <h2 className="text-2xl text-gray-500 font-black tracking-tight mb-6">RISK ANALYSIS RESULTS</h2>
      
      {/* Risk Level */}
      <div className="mb-8">
        <h3 className="text-lg text-gray-500 tracking-wide mb-4">RISK LEVEL</h3>
        <div className={`text-3xl text-gray-500 ${RiskCalculation.getRiskLevelColor(riskLevel)}`}>
          {riskLevel}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="mb-8">
        <h3 className="text-lg text-gray-500 tracking-wide mb-4">KEY METRICS</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4">
            <div className="text-sm text-gray-600">Position Size</div>
            <div className="text-lg font-semibold text-gray-500">{calculations.positionSize.toFixed(4)}</div>
          </div>
          <div className="bg-gray-50 p-4">
            <div className="text-sm text-gray-600">Margin Required</div>
            <div className="text-lg font-semibold text-gray-500">{RiskCalculation.formatCurrency(calculations.marginRequired)}</div>
          </div>
          <div className="bg-gray-50 p-4">
            <div className="text-sm text-gray-600">Liquidation Price</div>
            <div className="text-lg font-semibold text-gray-500">{RiskCalculation.formatCurrency(calculations.liquidationPrice)}</div>
          </div>
          <div className="bg-gray-50 p-4">
            <div className="text-sm text-gray-600">Max Loss %</div>
            <div className="text-lg font-semibold text-gray-500">{RiskCalculation.formatPercentage(calculations.maxLossPercentage)}</div>
          </div>
        </div>
      </div>

      {/* Potential Outcomes */}
      <div className="mb-8">
        <h3 className="text-lg text-gray-500 tracking-wide mb-4">POTENTIAL OUTCOMES</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 bg-green-50 border border-green-200">
            <div>
              <div className="font-medium text-green-800">Take Profit Hit</div>
              <div className="text-sm text-green-600">{simulations.find(s => s.scenario === 'takeProfitHit')?.description}</div>
            </div>
            <div className="text-right">
              <div className="font-semibold text-green-800">
                +{RiskCalculation.formatCurrency(calculations.potentialProfit)}
              </div>
              <div className="text-sm text-green-600">
                +{simulations.find(s => s.scenario === 'takeProfitHit')?.pnlPercentage.toFixed(2)}%
              </div>
            </div>
          </div>
          
          <div className="flex justify-between items-center p-3 bg-red-50 border border-red-200">
            <div>
              <div className="font-medium text-red-800">Stop Loss Hit</div>
              <div className="text-sm text-red-600">{simulations.find(s => s.scenario === 'stopLossHit')?.description}</div>
            </div>
            <div className="text-right">
              <div className="font-semibold text-red-800">
                -{RiskCalculation.formatCurrency(calculations.potentialLoss)}
              </div>
              <div className="text-sm text-red-600">
                {simulations.find(s => s.scenario === 'stopLossHit')?.pnlPercentage.toFixed(2)}%
              </div>
            </div>
          </div>
          
          <div className="flex justify-between items-center p-3 bg-orange-50 border border-orange-200">
            <div>
              <div className="font-medium text-orange-800">Liquidation</div>
              <div className="text-sm text-orange-600">{simulations.find(s => s.scenario === 'liquidation')?.description}</div>
            </div>
            <div className="text-right">
              <div className="font-semibold text-orange-800">
                -{RiskCalculation.formatCurrency(simulations.find(s => s.scenario === 'liquidation')?.pnl || 0)}
              </div>
              <div className="text-sm text-orange-600">
                {simulations.find(s => s.scenario === 'liquidation')?.pnlPercentage.toFixed(2)}%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Risk/Reward Ratio */}
      <div className="mb-8">
        <h3 className="text-lg text-gray-500 tracking-wide mb-4">RISK/REWARD RATIO</h3>
        <div className="text-center">
          <div className="text-4xl text-gray-500 mb-2">1:{calculations.riskRewardRatio.toFixed(2)}</div>
          <div className="text-sm text-gray-600">
            {calculations.riskRewardRatio >= 1.5 ? 'Good' : calculations.riskRewardRatio >= 1 ? 'Fair' : 'Poor'} Risk/Reward
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div>
        <h3 className="text-lg text-gray-500 tracking-wide mb-4">RECOMMENDATIONS</h3>
        <div className="space-y-2">
          {recommendations.map((recommendation, index) => (
            <div key={index} className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-black rounded-full mt-2 flex-shrink-0"></div>
              <div className="text-sm text-gray-700">{recommendation}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
