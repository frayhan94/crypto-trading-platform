'use client';

import { useState } from 'react';
import { PlanStatus, RiskLevel } from '../../domain/models/TradingPlan';
import { useAuth } from '../../components/auth/AuthProvider';
import { useTradingPlans, useUpdatePlanStatus, useDeleteTradingPlan } from '../../application/hooks/useTradingPlans';
import { DateUtils } from '../../domain/utils/DateUtils';
import { RiskCalculation } from '../../domain/utils/RiskCalculation';

export default function TradingPlansPage() {
  const { user } = useAuth();
  const [filter, setFilter] = useState<PlanStatus | 'ALL'>('ALL');

  // React Query hooks
  const { data: plans = [], isLoading, error } = useTradingPlans(user?.id || '');
  const updatePlanStatusMutation = useUpdatePlanStatus();
  const deletePlanMutation = useDeleteTradingPlan();

  const filteredPlans = filter === 'ALL' 
    ? plans 
    : plans.filter(plan => plan.status === filter);

  const handleStatusUpdate = async (planId: string, newStatus: PlanStatus) => {
    await updatePlanStatusMutation.mutateAsync({ id: planId, status: newStatus });
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
          <h1 className="text-2xl font-bold mb-4">Please Sign In</h1>
          <p className="text-gray-600">You need to be signed in to view your trading plans.</p>
          <a href="/login" className="inline-block mt-4 bg-black text-white px-6 py-2 rounded">
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Trading Plans</h1>
          <p className="text-gray-600">Manage and track your trading strategies</p>
        </div>

        {/* Navigation */}
        <div className="mb-6">
          <nav className="flex space-x-4">
            <a 
              href="/risk" 
              className="text-gray-600 hover:text-black px-3 py-2 rounded-md text-sm font-medium"
            >
              Analyze Risk
            </a>
            <a 
              href="/plans" 
              className="bg-black text-white px-3 py-2 rounded-md text-sm font-medium"
            >
              My Plans
            </a>
          </nav>
        </div>

        {/* Filter */}
        <div className="mb-6 flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">Filter by status:</label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as PlanStatus | 'ALL')}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm"
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
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error instanceof Error ? error.message : 'Failed to load trading plans'}
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-8">
            <div className="text-gray-500">Loading trading plans...</div>
          </div>
        )}

        {/* Plans List */}
        {!isLoading && filteredPlans.length === 0 && (
          <div className="text-center py-8">
            <div className="text-gray-500">
              {filter === 'ALL' 
                ? "You haven't created any trading plans yet." 
                : `No ${filter.toLowerCase()} plans found.`}
            </div>
            {filter === 'ALL' && (
              <a 
                href="/risk" 
                className="inline-block mt-4 bg-black text-white px-6 py-2 rounded"
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
              <div key={plan.id} className="bg-white border border-gray-300 rounded-lg p-6">
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
                    <p className="text-sm text-gray-500">
                      {DateUtils.formatRelativeTime(plan.createdAt)}
                    </p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(plan.status)}`}>
                    {plan.status}
                  </span>
                </div>

                {/* Description */}
                {plan.description && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{plan.description}</p>
                )}

                {/* Trading Details */}
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Entry:</span>
                    <span className="font-medium">${plan.entryPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Stop Loss:</span>
                    <span className="font-medium">${plan.stopLoss.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Take Profit:</span>
                    <span className="font-medium">${plan.takeProfit.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Leverage:</span>
                    <span className="font-medium">{plan.leverage}x</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Position:</span>
                    <span className="font-medium">{plan.positionType}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Risk Level:</span>
                    <span className={`font-medium ${getRiskLevelColor(plan.riskLevel)}`}>
                      {plan.riskLevel}
                    </span>
                  </div>
                </div>

                {/* Potential P/L */}
                <div className="border-t pt-4 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Potential Profit:</span>
                    <span className="font-medium text-green-600">
                      +${plan.potentialProfit.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Potential Loss:</span>
                    <span className="font-medium text-red-600">
                      -${plan.potentialLoss.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Risk/Reward:</span>
                    <span className="font-medium">1:{plan.riskRewardRatio.toFixed(2)}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-2">
                  {plan.status === PlanStatus.DRAFT && (
                    <button
                      onClick={() => handleStatusUpdate(plan.id, PlanStatus.ACTIVE)}
                      className="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700"
                    >
                      Activate
                    </button>
                  )}
                  {plan.status === PlanStatus.ACTIVE && (
                    <button
                      onClick={() => handleStatusUpdate(plan.id, PlanStatus.EXECUTED)}
                      className="flex-1 bg-green-600 text-white px-3 py-2 rounded text-sm hover:bg-green-700"
                    >
                      Execute
                    </button>
                  )}
                  {plan.status === PlanStatus.ACTIVE && (
                    <button
                      onClick={() => handleStatusUpdate(plan.id, PlanStatus.CANCELLED)}
                      className="flex-1 bg-red-600 text-white px-3 py-2 rounded text-sm hover:bg-red-700"
                    >
                      Cancel
                    </button>
                  )}
                  {(plan.status === PlanStatus.DRAFT || plan.status === PlanStatus.CANCELLED) && (
                    <button
                      onClick={() => handleDelete(plan.id)}
                      className="flex-1 bg-gray-600 text-white px-3 py-2 rounded text-sm hover:bg-gray-700"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
