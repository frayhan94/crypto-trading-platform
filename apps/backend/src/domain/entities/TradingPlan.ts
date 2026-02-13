export enum PositionType {
  LONG = 'LONG',
  SHORT = 'SHORT'
}

export enum PlanStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  EXECUTED = 'EXECUTED',
  CANCELLED = 'CANCELLED'
}

export enum RiskLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  EXTREME = 'EXTREME'
}

export class TradingPlan {
  public constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly name: string,
    public readonly description: string | null,
    public readonly status: PlanStatus,
    public readonly entryPrice: number,
    public readonly stopLoss: number,
    public readonly takeProfit: number,
    public readonly leverage: number,
    public readonly positionType: PositionType,
    public readonly riskPercentage: number,
    public readonly accountBalance: number,
    public readonly liquidationPrice: number,
    public readonly positionSize: number,
    public readonly marginRequired: number,
    public readonly orderValue: number,
    public readonly potentialProfit: number,
    public readonly potentialLoss: number,
    public readonly riskRewardRatio: number,
    public readonly maxLossPercentage: number,
    public readonly riskLevel: RiskLevel,
    public readonly recommendations: string[],
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly executedAt: Date | null
  ) {}

  static create(params: {
    id: string;
    userId: string;
    name: string;
    description?: string;
    entryPrice: number;
    stopLoss: number;
    takeProfit: number;
    leverage: number;
    positionType: PositionType;
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
    riskLevel: RiskLevel;
    recommendations: string[];
  }): TradingPlan {
    return new TradingPlan(
      params.id,
      params.userId,
      params.name,
      params.description || null,
      PlanStatus.DRAFT,
      params.entryPrice,
      params.stopLoss,
      params.takeProfit,
      params.leverage,
      params.positionType,
      params.riskPercentage,
      params.accountBalance,
      params.liquidationPrice,
      params.positionSize,
      params.marginRequired,
      params.orderValue,
      params.potentialProfit,
      params.potentialLoss,
      params.riskRewardRatio,
      params.maxLossPercentage,
      params.riskLevel,
      params.recommendations,
      new Date(),
      new Date(),
      null
    );
  }

  execute(): TradingPlan {
    if (this.status !== PlanStatus.ACTIVE) {
      throw new Error('Only active plans can be executed');
    }
    
    return new TradingPlan(
      this.id,
      this.userId,
      this.name,
      this.description,
      PlanStatus.EXECUTED,
      this.entryPrice,
      this.stopLoss,
      this.takeProfit,
      this.leverage,
      this.positionType,
      this.riskPercentage,
      this.accountBalance,
      this.liquidationPrice,
      this.positionSize,
      this.marginRequired,
      this.orderValue,
      this.potentialProfit,
      this.potentialLoss,
      this.riskRewardRatio,
      this.maxLossPercentage,
      this.riskLevel,
      this.recommendations,
      this.createdAt,
      new Date(),
      new Date()
    );
  }

  activate(): TradingPlan {
    if (this.status !== PlanStatus.DRAFT) {
      throw new Error('Only draft plans can be activated');
    }
    
    return new TradingPlan(
      this.id,
      this.userId,
      this.name,
      this.description,
      PlanStatus.ACTIVE,
      this.entryPrice,
      this.stopLoss,
      this.takeProfit,
      this.leverage,
      this.positionType,
      this.riskPercentage,
      this.accountBalance,
      this.liquidationPrice,
      this.positionSize,
      this.marginRequired,
      this.orderValue,
      this.potentialProfit,
      this.potentialLoss,
      this.riskRewardRatio,
      this.maxLossPercentage,
      this.riskLevel,
      this.recommendations,
      this.createdAt,
      new Date(),
      null
    );
  }

  cancel(): TradingPlan {
    if (this.status === PlanStatus.EXECUTED) {
      throw new Error('Cannot cancel executed plans');
    }
    
    return new TradingPlan(
      this.id,
      this.userId,
      this.name,
      this.description,
      PlanStatus.CANCELLED,
      this.entryPrice,
      this.stopLoss,
      this.takeProfit,
      this.leverage,
      this.positionType,
      this.riskPercentage,
      this.accountBalance,
      this.liquidationPrice,
      this.positionSize,
      this.marginRequired,
      this.orderValue,
      this.potentialProfit,
      this.potentialLoss,
      this.riskRewardRatio,
      this.maxLossPercentage,
      this.riskLevel,
      this.recommendations,
      this.createdAt,
      new Date(),
      null
    );
  }

  updateName(name: string): TradingPlan {
    if (this.status === PlanStatus.EXECUTED) {
      throw new Error('Cannot update executed plans');
    }
    
    return new TradingPlan(
      this.id,
      this.userId,
      name,
      this.description,
      this.status,
      this.entryPrice,
      this.stopLoss,
      this.takeProfit,
      this.leverage,
      this.positionType,
      this.riskPercentage,
      this.accountBalance,
      this.liquidationPrice,
      this.positionSize,
      this.marginRequired,
      this.orderValue,
      this.potentialProfit,
      this.potentialLoss,
      this.riskRewardRatio,
      this.maxLossPercentage,
      this.riskLevel,
      this.recommendations,
      this.createdAt,
      new Date(),
      this.executedAt
    );
  }

  updateDescription(description: string | null): TradingPlan {
    if (this.status === PlanStatus.EXECUTED) {
      throw new Error('Cannot update executed plans');
    }
    
    return new TradingPlan(
      this.id,
      this.userId,
      this.name,
      description,
      this.status,
      this.entryPrice,
      this.stopLoss,
      this.takeProfit,
      this.leverage,
      this.positionType,
      this.riskPercentage,
      this.accountBalance,
      this.liquidationPrice,
      this.positionSize,
      this.marginRequired,
      this.orderValue,
      this.potentialProfit,
      this.potentialLoss,
      this.riskRewardRatio,
      this.maxLossPercentage,
      this.riskLevel,
      this.recommendations,
      this.createdAt,
      new Date(),
      this.executedAt
    );
  }
}
