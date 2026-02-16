'use client';

import { useState, useCallback } from 'react';
import { TradingParameters } from '../../domain/models/TradingPlan';
import { CreateTradingPlanRequest } from '../../application/dtos';
import { useAnalyzeRisk } from '../hooks/useAnalyzeRisk';
import { useAuth } from '../../components/auth/AuthProvider';
import { useCreateTradingPlan } from '../../application/hooks/useTradingPlans';
import TradingInputForm from '../components/TradingInputForm';
import RiskDashboard from '../components/RiskDashboard';
import SavePlanModal from '../components/SavePlanModal';
import Navigation from '../../components/Navigation';

export default function RiskAnalysisPage() {
  const { user } = useAuth();
  const { analysis, isLoading, error, analyzeRisk, clearAnalysis } = useAnalyzeRisk();
  const createPlanMutation = useCreateTradingPlan();
  const [showSaveModal, setShowSaveModal] = useState(false);

  const handleAnalyze = useCallback(async (params: TradingParameters) => {
    await analyzeRisk(params);
  }, [analyzeRisk]);

  const handleSavePlan = useCallback(async (data: Omit<CreateTradingPlanRequest, 'userId'>) => {
    if (!user) return;
    
    try {
      await createPlanMutation.mutateAsync({
        ...data,
        userId: user.id,
      });
      
      setShowSaveModal(false);
      clearAnalysis();
    } catch (error) {
      console.error('Failed to create plan:', error);
    }
  }, [user, createPlanMutation, clearAnalysis]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Risk Analysis</h1>
          <p className="text-gray-600">Analyze your trading parameters and assess risk levels</p>
        </div>

        {/* Navigation */}
        <Navigation currentPage="risk" />

        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Input Form */}
          <div>
            <TradingInputForm onSubmit={handleAnalyze} isLoading={isLoading} />
          </div>

          {/* Results Dashboard */}
          <div>
            <RiskDashboard analysis={analysis} />
            
            {/* Save as Plan Button */}
            {analysis && user && (
              <div className="mt-6">
                <button
                  onClick={() => setShowSaveModal(true)}
                  className="w-full bg-black text-gray-500 py-3 font-black tracking-wide hover:bg-gray-800 transition-colors cursor-pointer"
                >
                  SAVE AS TRADING PLAN
                </button>
              </div>
            )}
            
            {analysis && !user && (
              <div className="mt-6 bg-gray-50 border border-gray-200 p-4 text-center">
                <p className="text-sm text-gray-600">
                  <a href="/login" className="font-black text-black hover:underline cursor-pointer">Sign in</a> to save this analysis as a trading plan
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Save Plan Modal */}
        {analysis && user && (
          <SavePlanModal
            isOpen={showSaveModal}
            onClose={() => setShowSaveModal(false)}
            analysis={analysis}
            userId={user.id}
            onSuccess={handleSavePlan}
          />
        )}
      </div>
    </div>
  );
}
