'use client';

import { useState } from 'react';
import { TradingParameters, PositionType } from '../../domain/models/TradingPlan';
import { TradingValidation } from '../../domain/rules/TradingValidation';

interface TradingInputFormProps {
  onSubmit: (params: TradingParameters) => void;
  isLoading?: boolean;
}

export default function TradingInputForm({ onSubmit, isLoading = false }: TradingInputFormProps) {
  const [formData, setFormData] = useState<TradingParameters>({
    entryPrice: 0,
    stopLoss: 0,
    takeProfit: 0,
    leverage: 1,
    positionType: PositionType.LONG,
    riskPercentage: 1,
    accountBalance: 10000,
  });

  const [errors, setErrors] = useState<string[]>([]);

  const handleChange = (field: keyof TradingParameters, value: number | string) => {
    setFormData(prev => ({
      ...prev,
      [field]: field === 'positionType' ? value as PositionType : Number(value)
    }));
    
    // Clear errors when user starts typing
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data
    const validationErrors = TradingValidation.validateTradingParameters(formData);
    
    if (validationErrors.length > 0) {
      setErrors(validationErrors.map(error => error.message));
      return;
    }
    
    onSubmit(formData);
  };

  return (
    <div className="bg-white border border-gray-300 p-8">
      <h2 className="text-2xl font-black tracking-tight mb-8">TRADING PARAMETERS</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {errors.length > 0 && (
          <div className="bg-red-50 border border-red-200 p-4">
            {errors.map((error, index) => (
              <p key={index} className="text-red-700 text-sm">{error}</p>
            ))}
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-black tracking-wide text-gray-700 mb-2">
              ENTRY PRICE
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.entryPrice || ''}
              onChange={(e) => handleChange('entryPrice', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 focus:border-black focus:ring-0 outline-none"
              placeholder="0.00"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-black tracking-wide text-gray-700 mb-2">
              STOP LOSS
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.stopLoss || ''}
              onChange={(e) => handleChange('stopLoss', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 focus:border-black focus:ring-0 outline-none"
              placeholder="0.00"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-black tracking-wide text-gray-700 mb-2">
              TAKE PROFIT
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.takeProfit || ''}
              onChange={(e) => handleChange('takeProfit', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 focus:border-black focus:ring-0 outline-none"
              placeholder="0.00"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-black tracking-wide text-gray-700 mb-2">
              LEVERAGE
            </label>
            <select
              value={formData.leverage}
              onChange={(e) => handleChange('leverage', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 focus:border-black focus:ring-0 outline-none"
            >
              {[1, 2, 5, 10, 20, 50, 100, 125].map(lev => (
                <option key={lev} value={lev}>{lev}x</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-black tracking-wide text-gray-700 mb-2">
              POSITION TYPE
            </label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value={PositionType.LONG}
                  checked={formData.positionType === PositionType.LONG}
                  onChange={(e) => handleChange('positionType', e.target.value)}
                  className="mr-2"
                />
                <span className="text-sm font-medium">LONG</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value={PositionType.SHORT}
                  checked={formData.positionType === PositionType.SHORT}
                  onChange={(e) => handleChange('positionType', e.target.value)}
                  className="mr-2"
                />
                <span className="text-sm font-medium">SHORT</span>
              </label>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-black tracking-wide text-gray-700 mb-2">
              RISK PERCENTAGE
            </label>
            <input
              type="number"
              step="0.1"
              min="0.1"
              max="100"
              value={formData.riskPercentage || ''}
              onChange={(e) => handleChange('riskPercentage', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 focus:border-black focus:ring-0 outline-none"
              placeholder="1.0"
              required
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-black tracking-wide text-gray-700 mb-2">
              ACCOUNT BALANCE
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.accountBalance || ''}
              onChange={(e) => handleChange('accountBalance', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 focus:border-black focus:ring-0 outline-none"
              placeholder="10000.00"
              required
            />
          </div>
        </div>
        
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-black text-white py-4 font-black tracking-wide hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'ANALYZING...' : 'ANALYZE RISK'}
        </button>
      </form>
    </div>
  );
}
