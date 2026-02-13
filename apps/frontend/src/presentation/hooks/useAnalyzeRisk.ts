import { useState, useCallback } from 'react';
import { TradingParameters, RiskAnalysis } from '../../domain/models/TradingPlan';
import { AnalyzeRiskUseCase } from '../../application/use-cases/AnalyzeRisk';

interface UseAnalyzeRiskState {
  analysis: RiskAnalysis | null;
  isLoading: boolean;
  error: string | null;
}

export const useAnalyzeRisk = () => {
  const [state, setState] = useState<UseAnalyzeRiskState>({
    analysis: null,
    isLoading: false,
    error: null,
  });

  const analyzeRisk = useCallback(async (params: TradingParameters) => {
    setState({ analysis: null, isLoading: true, error: null });

    const useCase = new AnalyzeRiskUseCase();
    const result = useCase.execute(params);

    setState({
      analysis: result.success ? result.data || null : null,
      isLoading: false,
      error: result.success ? null : result.errors?.join(', ') || 'Analysis failed',
    });

    return result;
  }, []);

  const clearAnalysis = useCallback(() => {
    setState({ analysis: null, isLoading: false, error: null });
  }, []);

  return {
    ...state,
    analyzeRisk,
    clearAnalysis,
  };
};
