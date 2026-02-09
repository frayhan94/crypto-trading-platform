const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface CreatePlanData {
  userId: string;
  name: string;
  description?: string;
  entryPrice: number;
  stopLoss: number;
  takeProfit: number;
  leverage: number;
  positionType: 'LONG' | 'SHORT';
  riskPercentage: number;
  accountBalance: number;
  liquidationPrice: number;
  positionSize: number;
  marginRequired: number;
  orderValue: number;
  potentialProfit: number;
  potentialLoss: number;
  riskRewardRatio: number;
  maxLossPercentage: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';
  recommendations: string[];
}

interface TradingPlan extends CreatePlanData {
  id: string;
  status: 'DRAFT' | 'ACTIVE' | 'EXECUTED' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
  executedAt?: string;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export async function createPlan(data: CreatePlanData): Promise<ApiResponse<TradingPlan>> {
  try {
    const response = await fetch(`${API_URL}/api/plans`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return await response.json();
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create plan',
    };
  }
}

export async function getUserPlans(userId: string): Promise<ApiResponse<TradingPlan[]>> {
  try {
    const response = await fetch(`${API_URL}/api/plans/user/${userId}`);
    return await response.json();
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch plans',
    };
  }
}

export async function getPlan(id: string): Promise<ApiResponse<TradingPlan>> {
  try {
    const response = await fetch(`${API_URL}/api/plans/${id}`);
    return await response.json();
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch plan',
    };
  }
}

export async function updatePlanStatus(
  id: string, 
  status: 'DRAFT' | 'ACTIVE' | 'EXECUTED' | 'CANCELLED'
): Promise<ApiResponse<TradingPlan>> {
  try {
    const response = await fetch(`${API_URL}/api/plans/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });
    return await response.json();
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update plan',
    };
  }
}

export async function deletePlan(id: string): Promise<ApiResponse<void>> {
  try {
    const response = await fetch(`${API_URL}/api/plans/${id}`, {
      method: 'DELETE',
    });
    return await response.json();
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete plan',
    };
  }
}

export type { CreatePlanData, TradingPlan, ApiResponse };
