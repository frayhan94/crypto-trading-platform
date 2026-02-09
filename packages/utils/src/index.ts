// Currency Formatting
export function formatCurrency(value: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
}

export function parseCurrency(value: string): number {
  const cleaned = value.replace(/[^0-9.-]/g, '');
  return parseFloat(cleaned) || 0;
}

// Percentage Formatting
export function formatPercentage(value: number, decimals: number = 2): string {
  return `${value.toFixed(decimals)}%`;
}

// Number Formatting
export function formatNumber(value: number, decimals: number = 2): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value);
}

// Risk Calculations
export function calculateLiquidationPrice(
  entryPrice: number,
  leverage: number,
  isLong: boolean = true
): number {
  const maintenanceMarginRate = 0.005;
  const liquidationThreshold = 1 - maintenanceMarginRate;

  if (isLong) {
    return entryPrice * (1 - (1 / leverage) * liquidationThreshold);
  } else {
    return entryPrice * (1 + (1 / leverage) * liquidationThreshold);
  }
}

export function calculatePositionSize(
  balance: number,
  riskPercentage: number,
  entryPrice: number,
  stopLoss: number
): number {
  const riskAmount = balance * (riskPercentage / 100);
  const stopLossDistance = Math.abs(entryPrice - stopLoss);
  return riskAmount / stopLossDistance;
}

export function calculateRiskRewardRatio(
  entryPrice: number,
  stopLoss: number,
  takeProfit: number
): number {
  const risk = Math.abs(entryPrice - stopLoss);
  const reward = Math.abs(takeProfit - entryPrice);
  return reward / risk;
}

// Validation
export function isValidPrice(price: number): boolean {
  return price > 0 && isFinite(price);
}

export function isValidLeverage(leverage: number): boolean {
  return leverage >= 1 && leverage <= 125;
}

export function isValidRiskPercentage(percentage: number): boolean {
  return percentage > 0 && percentage <= 100;
}

// ID Generation
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Date Formatting
export function formatTimestamp(timestamp: number | string | Date): string {
  const date = new Date(timestamp);
  return date.toISOString();
}

export function formatDateTime(timestamp: number | string | Date): string {
  const date = new Date(timestamp);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}
