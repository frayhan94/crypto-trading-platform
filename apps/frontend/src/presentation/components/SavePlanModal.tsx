'use client';

import { useState } from 'react';
import { RiskAnalysis } from '../../domain/models/TradingPlan';
import { TradingValidation } from '../../domain/rules/TradingValidation';
import { CreateTradingPlanRequest } from '../../application/dtos';

interface SavePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysis: RiskAnalysis;
  userId: string;
  onSuccess?: (data: Omit<CreateTradingPlanRequest, 'userId'>) => void;
}

export default function SavePlanModal({ 
  isOpen, 
  onClose, 
  analysis, 
  userId,
  onSuccess 
}: SavePlanModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Validate form
    const nameErrors = TradingValidation.validatePlanName(name);
    const descriptionErrors = TradingValidation.validatePlanDescription(description);
    
    if (nameErrors.length > 0 || descriptionErrors.length > 0) {
      const allErrors = [...nameErrors, ...descriptionErrors];
      setError(allErrors.map(error => error.message).join(', '));
      setIsLoading(false);
      return;
    }

    const { parameters, calculations, riskLevel, recommendations } = analysis;

    const planData = {
      userId,
      name,
      description: description || undefined,
      entryPrice: parameters.entryPrice,
      stopLoss: parameters.stopLoss,
      takeProfit: parameters.takeProfit,
      leverage: parameters.leverage,
      positionType: parameters.positionType as 'LONG' | 'SHORT',
      riskPercentage: parameters.riskPercentage,
      accountBalance: parameters.accountBalance,
      liquidationPrice: calculations.liquidationPrice,
      positionSize: calculations.positionSize,
      marginRequired: calculations.marginRequired,
      orderValue: calculations.orderValue,
      potentialProfit: calculations.potentialProfit,
      potentialLoss: calculations.potentialLoss,
      riskRewardRatio: calculations.riskRewardRatio,
      maxLossPercentage: calculations.maxLossPercentage,
      riskLevel: riskLevel as 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME',
      recommendations,
    };

    if (onSuccess) {
      await onSuccess(planData);
    }

    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-black/50" 
        onClick={onClose}
      />
      
      <div className="relative bg-white border border-gray-300 p-8 max-w-md w-full mx-4">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-black cursor-pointer"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h2 className="text-2xl font-black tracking-tight mb-6">SAVE AS TRADING PLAN</h2>

        <form onSubmit={handleSave} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="name" className="block text-sm font-black tracking-wide text-gray-700 mb-2">
              PLAN NAME *
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 focus:border-black focus:ring-0 outline-none"
              placeholder="e.g., BTC Long Position"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-black tracking-wide text-gray-700 mb-2">
              DESCRIPTION
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 focus:border-black focus:ring-0 outline-none resize-none"
              placeholder="Optional notes about this trade..."
            />
          </div>

          <div className="bg-gray-50 border border-gray-200 p-4 text-sm">
            <p className="font-black text-gray-700 mb-2">PLAN SUMMARY</p>
            <div className="grid grid-cols-2 gap-2 text-gray-600">
              <div>Entry: ${analysis.parameters.entryPrice.toLocaleString()}</div>
              <div>Leverage: {analysis.parameters.leverage}x</div>
              <div>Stop Loss: ${analysis.parameters.stopLoss.toLocaleString()}</div>
              <div>Take Profit: ${analysis.parameters.takeProfit.toLocaleString()}</div>
              <div className="col-span-2">
                Risk Level: <span className={`font-black ${
                  analysis.riskLevel === 'LOW' ? 'text-green-600' :
                  analysis.riskLevel === 'MEDIUM' ? 'text-yellow-600' :
                  analysis.riskLevel === 'HIGH' ? 'text-orange-600' : 'text-red-600'
                }`}>{analysis.riskLevel}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border border-gray-300 font-black tracking-wide hover:bg-gray-50 transition-colors cursor-pointer"
            >
              CANCEL
            </button>
            <button
              type="submit"
              disabled={isLoading || !name.trim()}
              className="flex-1 bg-black text-white py-3 font-black tracking-wide hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? 'SAVING...' : 'SAVE PLAN'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
