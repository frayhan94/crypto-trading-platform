import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { TradingPlan, PlanStatus } from '../../domain/models/TradingPlan';
import { TradingPlanService } from '../services/TradingPlanService';
import { CreateTradingPlanUseCase, CreateTradingPlanRequest } from '../use-cases/CreateTradingPlan';
import { TradingPlanRepository } from '../../infrastructure/api/TradingPlanRepository';

interface TradingPlanState {
  plans: TradingPlan[];
  currentPlan: TradingPlan | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchPlans: (userId: string) => Promise<void>;
  fetchPlan: (id: string) => Promise<void>;
  createPlan: (data: CreateTradingPlanRequest) => Promise<{ success: boolean; error?: string }>;
  updatePlanStatus: (id: string, status: PlanStatus) => Promise<void>;
  deletePlan: (id: string) => Promise<void>;
  clearError: () => void;
  setCurrentPlan: (plan: TradingPlan | null) => void;
  getPlansByStatus: (userId: string, status: PlanStatus) => TradingPlan[];
}

export const useTradingPlanStore = create<TradingPlanState>()(
  devtools(
    (set, get) => {
      const tradingPlanService = new TradingPlanService(new TradingPlanRepository());
      const createPlanUseCase = new CreateTradingPlanUseCase(new TradingPlanRepository());

      return {
        // Initial state
        plans: [],
        currentPlan: null,
        isLoading: false,
        error: null,

        // Actions
        fetchPlans: async (userId: string) => {
          set({ isLoading: true, error: null });
          
          try {
            const result = await tradingPlanService.getUserPlans(userId);
            
            if (result.success && result.data) {
              set({ plans: result.data, isLoading: false });
            } else {
              set({ error: result.error || 'Failed to fetch plans', isLoading: false });
            }
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : 'Unexpected error', 
              isLoading: false 
            });
          }
        },

        fetchPlan: async (id: string) => {
          set({ isLoading: true, error: null });
          
          try {
            const result = await tradingPlanService.getPlan(id);
            
            if (result.success && result.data) {
              set({ currentPlan: result.data, isLoading: false });
            } else {
              set({ error: result.error || 'Failed to fetch plan', isLoading: false });
            }
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : 'Unexpected error', 
              isLoading: false 
            });
          }
        },

        createPlan: async (data: CreateTradingPlanRequest) => {
          set({ isLoading: true, error: null });
          
          try {
            const result = await createPlanUseCase.execute(data);
            
            if (result.success) {
              // Refresh plans list
              const userId = data.userId;
              await get().fetchPlans(userId);
              
              set({ isLoading: false });
              return { success: true };
            } else {
              set({ error: result.error || 'Failed to create plan', isLoading: false });
              return { success: false, error: result.error };
            }
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unexpected error';
            set({ error: errorMessage, isLoading: false });
            return { success: false, error: errorMessage };
          }
        },

        updatePlanStatus: async (id: string, status: PlanStatus) => {
          set({ isLoading: true, error: null });
          
          try {
            const result = await tradingPlanService.updatePlanStatus(id, status);
            
            if (result.success) {
              // Update the plan in the list
              const { plans } = get();
              const updatedPlans = plans.map(plan => 
                plan.id === id ? { ...plan, status, updatedAt: new Date() } : plan
              );
              
              set({ 
                plans: updatedPlans, 
                currentPlan: result.data || null,
                isLoading: false 
              });
            } else {
              set({ error: result.error || 'Failed to update plan', isLoading: false });
            }
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : 'Unexpected error', 
              isLoading: false 
            });
          }
        },

        deletePlan: async (id: string) => {
          set({ isLoading: true, error: null });
          
          try {
            const result = await tradingPlanService.deletePlan(id);
            
            if (result.success) {
              // Remove the plan from the list
              const { plans } = get();
              const updatedPlans = plans.filter(plan => plan.id !== id);
              
              set({ 
                plans: updatedPlans, 
                currentPlan: null,
                isLoading: false 
              });
            } else {
              set({ error: result.error || 'Failed to delete plan', isLoading: false });
            }
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : 'Unexpected error', 
              isLoading: false 
            });
          }
        },

        clearError: () => set({ error: null }),

        setCurrentPlan: (plan: TradingPlan | null) => set({ currentPlan: plan }),

        getPlansByStatus: (userId: string, status: PlanStatus) => {
          const { plans } = get();
          return plans.filter(plan => plan.userId === userId && plan.status === status);
        },
      };
    },
    {
      name: 'trading-plan-store',
    }
  )
);
