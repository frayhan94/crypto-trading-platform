'use client';

import { useState } from 'react';
import { PlanStatus, RiskLevel } from '../../domain/models/TradingPlan';
import { useAuth } from '../../components/auth/AuthProvider';
import { useTradingPlans, useUpdatePlanStatus, useDeleteTradingPlan } from '../../application/hooks/useTradingPlans';
import { DateUtils } from '../../domain/utils/DateUtils';
import { RiskCalculation } from '../../domain/utils/RiskCalculation';
import Navigation from '../../components/Navigation';
import Modal from '../../components/Modal';

export default function TradingPlansPage() {
  const { user } = useAuth();
  const [filter, setFilter] = useState<PlanStatus | 'ALL'>('ALL');
  const [successModal, setSuccessModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
  }>({ isOpen: false, title: '', message: '' });
  const [updatingPlanId, setUpdatingPlanId] = useState<string | null>(null);

  // React Query hooks
  const { data: plans = [], isLoading, error } = useTradingPlans(user?.id || '');
  const updatePlanStatusMutation = useUpdatePlanStatus();
  const deletePlanMutation = useDeleteTradingPlan();

  const filteredPlans = filter === 'ALL' 
    ? plans 
    : plans.filter(plan => plan.status === filter);

  const handleStatusUpdate = async (planId: string, newStatus: PlanStatus) => {
    const plan = plans.find(p => p.id === planId);
    const planName = plan?.name || 'Trading Plan';
    
    setUpdatingPlanId(planId);
    
    try {
      await updatePlanStatusMutation.mutateAsync({ id: planId, status: newStatus });
      
      let title = '';
      let message = '';
      
      switch (newStatus) {
        case PlanStatus.ACTIVE:
          title = 'PLAN ACTIVATED';
          message = `"${planName}" has been successfully activated and is now ready for execution.`;
          break;
        case PlanStatus.EXECUTED:
          title = 'PLAN EXECUTED';
          message = `"${planName}" has been marked as executed.`;
          break;
        case PlanStatus.CANCELLED:
          title = 'PLAN CANCELLED';
          message = `"${planName}" has been cancelled.`;
          break;
      }
      
      setSuccessModal({ isOpen: true, title, message });
    } catch (error) {
      console.error('Failed to update plan status:', error);
    } finally {
      setUpdatingPlanId(null);
    }
  };

  const handleDelete = async (planId: string) => {
    if (window.confirm('Are you sure you want to delete this trading plan?')) {
      await deletePlanMutation.mutateAsync(planId);
    }
  };

  const getStatusColor = (status: PlanStatus) => {
    switch (status) {
      case PlanStatus.DRAFT: return 'bg-gray-100 text-gray-800';
      case PlanStatus.ACTIVE: return 'bg-blue-100 text-blue-800';
      case PlanStatus.EXECUTED: return 'bg-green-100 text-green-800';
      case PlanStatus.CANCELLED: return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskLevelColor = (riskLevel: string) => {
    return RiskCalculation.getRiskLevelColor(riskLevel as RiskLevel);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-black tracking-tight mb-4">Please Sign In</h1>
          <p className="text-gray-700 font-light">You need to be signed in to view your trading plans.</p>
          <a href="/login" className="inline-block mt-4 bg-black text-white px-6 py-3 font-black tracking-wider hover:bg-gray-800 transition-colors cursor-pointer">
            Sign In
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black tracking-tight text-black mb-2">My Trading Plans</h1>
          <p className="text-gray-700 font-light">Manage and track your trading strategies</p>
        </div>

        {/* Navigation */}
        <Navigation currentPage="plans" />

        {/* Filter */}
        <div className="mb-6 flex items-center space-x-4">
          <label className="text-sm font-black tracking-wide text-gray-700">Filter by status:</label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as PlanStatus | 'ALL')}
            className="border border-gray-300 px-4 py-2 text-sm focus:border-black focus:ring-0 outline-none"
          >
            <option value="ALL">All Plans</option>
            <option value={PlanStatus.DRAFT}>Draft</option>
            <option value={PlanStatus.ACTIVE}>Active</option>
            <option value={PlanStatus.EXECUTED}>Executed</option>
            <option value={PlanStatus.CANCELLED}>Cancelled</option>
          </select>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6 bg-white border-2 border-black shadow-2xl p-6">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">❌</span>
              <div>
                <h3 className="text-xl font-black tracking-tight text-black mb-1">Error</h3>
                <p className="text-gray-700 font-light">
                  {error instanceof Error ? error.message : 'Failed to load trading plans'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-8">
            <div className="text-gray-700 font-light">Loading trading plans...</div>
          </div>
        )}

        {/* Plans List */}
        {!isLoading && filteredPlans.length === 0 && (
          <div className="text-center py-8">
            <div className="text-gray-700 font-light">
              {filter === 'ALL' 
                ? "You haven't created any trading plans yet." 
                : `No ${filter.toLowerCase()} plans found.`}
            </div>
            {filter === 'ALL' && (
              <a 
                href="/risk" 
                className="inline-block mt-4 bg-black text-white px-6 py-3 font-black tracking-wider hover:bg-gray-800 transition-colors cursor-pointer"
              >
                Create Your First Plan
              </a>
            )}
          </div>
        )}

        {/* Plans Grid */}
        {!isLoading && filteredPlans.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPlans.map((plan) => (
              <div key={plan.id} className="bg-white border-2 border-black shadow-2xl p-6">
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-black tracking-tight text-black">{plan.name}</h3>
                    <p className="text-sm text-gray-700 font-light">
                      {DateUtils.formatRelativeTime(plan.createdAt)}
                    </p>
                  </div>
                  <span className={`px-3 py-1 text-xs font-black tracking-wide border-2 border-black ${getStatusColor(plan.status)}`}>
                    {plan.status}
                  </span>
                </div>

                {/* Description */}
                {plan.description && (
                  <p className="text-sm text-gray-700 font-light mb-4 line-clamp-2">{plan.description}</p>
                )}

                {/* Trading Details */}
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700 font-light">Entry:</span>
                    <span className="text-gray-500 tracking-wide">${plan.entryPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700 font-light">Stop Loss:</span>
                    <span className="text-gray-500 tracking-wide">${plan.stopLoss.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700 font-light">Take Profit:</span>
                    <span className="text-gray-500 tracking-wide">${plan.takeProfit.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700 font-light">Leverage:</span>
                    <span className="text-gray-500 tracking-wide">{plan.leverage}x</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700 font-light">Position:</span>
                    <span className="text-gray-500 tracking-wide">{plan.positionType}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700 font-light">Risk Level:</span>
                    <span className={`text-gray-500 tracking-wide ${getRiskLevelColor(plan.riskLevel)}`}>
                      {plan.riskLevel}
                    </span>
                  </div>
                </div>

                {/* Potential P/L */}
                <div className="border-t-2 border-black pt-4 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700 font-light">Potential Profit:</span>
                    <span className="font-black tracking-wide text-green-600">
                      +${plan.potentialProfit.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700 font-light">Potential Loss:</span>
                    <span className="font-black tracking-wide text-red-600">
                      -${plan.potentialLoss.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700 font-light">Risk/Reward:</span>
                    <span className="text-gray-500 tracking-wide">1:{plan.riskRewardRatio.toFixed(2)}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-2">
                  {plan.status === PlanStatus.DRAFT && (
                    <button
                      onClick={() => handleStatusUpdate(plan.id, PlanStatus.ACTIVE)}
                      disabled={updatingPlanId === plan.id}
                      className="flex-1 bg-black text-white px-3 py-2 font-black tracking-wide hover:bg-gray-800 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {updatingPlanId === plan.id ? 'ACTIVATING...' : 'ACTIVATE'}
                    </button>
                  )}
                  {plan.status === PlanStatus.ACTIVE && (
                    <button
                      onClick={() => handleStatusUpdate(plan.id, PlanStatus.EXECUTED)}
                      disabled={updatingPlanId === plan.id}
                      className="flex-1 bg-black text-white px-3 py-2 font-black tracking-wide hover:bg-gray-800 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {updatingPlanId === plan.id ? 'EXECUTING...' : 'EXECUTE'}
                    </button>
                  )}
                  {plan.status === PlanStatus.ACTIVE && (
                    <button
                      onClick={() => handleStatusUpdate(plan.id, PlanStatus.CANCELLED)}
                      disabled={updatingPlanId === plan.id}
                      className="flex-1 border-2 border-black px-3 py-2 font-black tracking-wide hover:bg-black hover:text-white transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {updatingPlanId === plan.id ? 'CANCELLING...' : 'CANCEL'}
                    </button>
                  )}
                  {(plan.status === PlanStatus.DRAFT || plan.status === PlanStatus.CANCELLED) && (
                    <button
                      onClick={() => handleDelete(plan.id)}
                      disabled={updatingPlanId === plan.id}
                      className="flex-1 border-2 border-black px-3 py-2 font-black tracking-wide hover:bg-black hover:text-white transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-black"
                    >
                      DELETE
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Success Modal */}
      <Modal
        isOpen={successModal.isOpen}
        onClose={() => setSuccessModal({ isOpen: false, title: '', message: '' })}
        title={successModal.title}
        message={successModal.message}
        type="success"
      />
    </div>
  );
}
