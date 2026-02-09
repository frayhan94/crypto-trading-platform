'use client';

import {useState, useCallback} from 'react';
import TradingInputForm from '@/components/TradingInputForm';
import RiskDashboard from '@/components/RiskDashboard';
import RiskProtocol from '@/components/RiskProtocol';
import { analyzeRisk } from '@/lib/riskCalculations';
import type { TradingParams, AnalysisState, ErrorMessage, TradingParameters } from '@repo/types';

// Google Analytics types
declare global {
  interface Window {
    gtag?: (command: string, action: string, options?: Record<string, any>) => void;
  }
}

export default function RiskPage() {
  const [state, setState] = useState<AnalysisState>({
    analysis: null,
    isLoading: false,
    error: null,
    validations: []
  });

  const [errors, setErrors] = useState<ErrorMessage[]>([]);

  const addError = useCallback((message: string, type: ErrorMessage['type'] = 'error') => {
    const error: ErrorMessage = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      message,
      type,
      timestamp: Date.now(),
      dismissible: true
    };
    setErrors(prev => [...prev, error]);
  }, []);

  const dismissError = useCallback((id: string) => {
    setErrors(prev => prev.filter(error => error.id !== id));
  }, []);

  const validateInputs = useCallback((params: TradingParams): string[] => {
    const validationErrors: string[] = [];

    if (params.entryPrice <= 0) {
      validationErrors.push('Entry price must be greater than 0');
    }
    if (params.stopLoss <= 0) {
      validationErrors.push('Stop loss must be greater than 0');
    }
    if (params.takeProfit <= 0) {
      validationErrors.push('Take profit must be greater than 0');
    }
    if (params.accountBalance <= 0) {
      validationErrors.push('Account balance must be greater than 0');
    }
    if (params.riskPercentage && (params.riskPercentage <= 0 || params.riskPercentage > 100)) {
      validationErrors.push('Risk percentage must be between 0 and 100');
    }
    if (params.leverage <= 0 || params.leverage > 100) {
      validationErrors.push('Leverage must be between 0 and 100');
    }

    // Validate logical relationships
    if (params.positionType === 'long') {
      if (params.stopLoss >= params.entryPrice) {
        validationErrors.push('456 For long positions, stop loss must be below entry price');
      }
      if (params.takeProfit <= params.entryPrice) {
        validationErrors.push('123 For long positions, take profit must be above entry price');
      }
    } else {
      if (params.stopLoss <= params.entryPrice) {
        validationErrors.push('For short positions, stop loss must be above entry price');
      }
      if (params.takeProfit >= params.entryPrice) {
        validationErrors.push('For short positions, take profit must be below entry price');
      }
    }

    return validationErrors;
  }, []);

  const handleAnalyze = useCallback(async (params: TradingParams) => {
    // Clear previous errors
    setState(prev => ({ ...prev, error: null, validations: [] }));
    setErrors([]);

    // Validate inputs
    const validationErrors = validateInputs(params);
    if (validationErrors.length > 0) {
      setState(prev => ({
        ...prev,
        validations: validationErrors.map((message, index) => ({
          field: Object.keys(params)[index] as keyof TradingParams,
          message,
          value: params[Object.keys(params)[index] as keyof TradingParams]
        }))
      }));
      validationErrors.forEach(error => addError(error, 'warning'));
      return;
    }

    setState(prev => ({ ...prev, isLoading: true }));

    try {
      // Simulate processing time for better UX
      await new Promise(resolve => setTimeout(resolve, 500));

      // Convert to TradingParameters for the analyzeRisk function
      const tradingParams: TradingParameters = {
        balance: params.accountBalance,
        leverage: params.leverage,
        entryPrice: params.entryPrice,
        stopLoss: params.stopLoss,
        takeProfit: params.takeProfit,
        riskPercentage: params.riskPercentage
      };

      const result = analyzeRisk(tradingParams);
      setState(prev => ({
        ...prev,
        analysis: result,
        isLoading: false
      }));

      // Track successful analysis
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'risk_analysis_completed', {
          position_type: params.positionType,
          leverage: params.leverage,
          risk_percentage: params.riskPercentage
        });
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Risk analysis failed';
      setState(prev => ({
        ...prev,
        error: errorMessage,
        isLoading: false
      }));
      addError(errorMessage, 'error');

      // Track error
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'risk_analysis_error', {
          error_message: errorMessage
        });
      }

      console.error('Risk analysis error:', error);
    }
  }, [validateInputs, addError]);

  return (
    <div className="min-h-screen bg-white text-black py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Error Notifications */}
        {errors.length > 0 && (
          <div className="mb-6 space-y-2">
            {errors.map(error => (
              <div
                key={error.id}
                className={`p-4 rounded-lg border flex items-center justify-between ${
                  error.type === 'error' 
                    ? 'bg-red-50 border-red-200 text-red-800'
                    : error.type === 'warning'
                    ? 'bg-yellow-50 border-yellow-200 text-yellow-800'
                    : 'bg-blue-50 border-blue-200 text-blue-800'
                }`}
                role="alert"
              >
                <div className="flex items-center">
                  <span className="mr-2">
                    {error.type === 'error' ? '❌' : error.type === 'warning' ? '⚠️' : 'ℹ️'}
                  </span>
                  <span className="font-medium">{error.message}</span>
                </div>
                {error.dismissible && (
                  <button
                    onClick={() => dismissError(error.id)}
                    className="ml-4 text-gray-500 hover:text-gray-700"
                    aria-label="Dismiss error"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Input Form */}
          <div>
            <TradingInputForm
              onSubmit={handleAnalyze}
              isLoading={state.isLoading}
            />
          </div>

          {/* Results Dashboard */}
          <div>
            <RiskDashboard
              analysis={state.analysis}
            />
          </div>
        </div>

        {/* Risk Protocol Section */}
        <RiskProtocol />
      </div>
    </div>
  );
}
