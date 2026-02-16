import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TradingPlanService } from '../services/TradingPlanService';
import { CreateTradingPlanUseCase } from '../use-cases/CreateTradingPlan';
import { TradingPlanRepository } from '../../infrastructure/api/TradingPlanRepository';
import { PlanStatus } from '../../domain/models/TradingPlan';
import { CreateTradingPlanRequest } from '../dtos';

// Initialize services
const tradingPlanService = new TradingPlanService(new TradingPlanRepository());
const createPlanUseCase = new CreateTradingPlanUseCase(new TradingPlanRepository());

// Query keys
export const tradingPlanKeys = {
  all: ['tradingPlans'] as const,
  lists: () => [...tradingPlanKeys.all, 'list'] as const,
  list: (userId: string) => [...tradingPlanKeys.lists(), userId] as const,
  details: () => [...tradingPlanKeys.all, 'detail'] as const,
  detail: (id: string) => [...tradingPlanKeys.details(), id] as const,
  byStatus: (userId: string, status: PlanStatus) => [...tradingPlanKeys.list(userId), 'status', status] as const,
};

// Hooks
export function useTradingPlans(userId: string) {
  return useQuery({
    queryKey: tradingPlanKeys.list(userId),
    queryFn: () => tradingPlanService.getUserPlans(userId),
    enabled: !!userId,
    select: (data) => data.data || [],
  });
}

export function useTradingPlan(id: string) {
  return useQuery({
    queryKey: tradingPlanKeys.detail(id),
    queryFn: () => tradingPlanService.getPlan(id),
    enabled: !!id,
    select: (data) => data.data,
  });
}

export function useTradingPlansByStatus(userId: string, status: PlanStatus) {
  return useQuery({
    queryKey: tradingPlanKeys.byStatus(userId, status),
    queryFn: () => tradingPlanService.getPlansByStatus(userId, status),
    enabled: !!userId && !!status,
    select: (data) => data.data || [],
  });
}

export function useCreateTradingPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTradingPlanRequest) => createPlanUseCase.execute(data),
    onSuccess: (_, variables) => {
      // Invalidate and refetch the user's plans list
      queryClient.invalidateQueries({ queryKey: tradingPlanKeys.list(variables.userId) });
    },
  });
}

export function useUpdatePlanStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: PlanStatus }) => 
      tradingPlanService.updatePlanStatus(id, status),
    onSuccess: (result, variables) => {
      // Update the specific plan in cache
      if (result.data) {
        queryClient.setQueryData(tradingPlanKeys.detail(variables.id), result.data);
      }
      
      // Invalidate the list to ensure consistency
      queryClient.invalidateQueries({ queryKey: tradingPlanKeys.lists() });
    },
  });
}

export function useDeleteTradingPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => tradingPlanService.deletePlan(id),
    onSuccess: (_, deletedId) => {
      // Remove the deleted plan from cache
      queryClient.removeQueries({ queryKey: tradingPlanKeys.detail(deletedId) });
      
      // Invalidate the list to ensure consistency
      queryClient.invalidateQueries({ queryKey: tradingPlanKeys.lists() });
    },
  });
}
