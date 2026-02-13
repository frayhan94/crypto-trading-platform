import { TradingPlan, PlanStatus, PositionType, RiskLevel } from '../../domain/entities/TradingPlan';
import { TradingPlanRepository } from '../../domain/repositories/TradingPlanRepository';
import prisma from '../lib/prisma';

export class PrismaTradingPlanRepository implements TradingPlanRepository {
  async create(plan: TradingPlan): Promise<TradingPlan> {
    const created = await prisma.tradingPlan.create({
      data: {
        id: plan.id,
        userId: plan.userId,
        name: plan.name,
        description: plan.description,
        status: plan.status,
        entryPrice: plan.entryPrice,
        stopLoss: plan.stopLoss,
        takeProfit: plan.takeProfit,
        leverage: plan.leverage,
        positionType: plan.positionType,
        riskPercentage: plan.riskPercentage,
        accountBalance: plan.accountBalance,
        liquidationPrice: plan.liquidationPrice,
        positionSize: plan.positionSize,
        marginRequired: plan.marginRequired,
        orderValue: plan.orderValue,
        potentialProfit: plan.potentialProfit,
        potentialLoss: plan.potentialLoss,
        riskRewardRatio: plan.riskRewardRatio,
        maxLossPercentage: plan.maxLossPercentage,
        riskLevel: plan.riskLevel,
        recommendations: plan.recommendations,
        createdAt: plan.createdAt,
        updatedAt: plan.updatedAt,
        executedAt: plan.executedAt,
      },
    });

    return this.mapToDomainEntity(created);
  }

  async findById(id: string): Promise<TradingPlan | null> {
    const found = await prisma.tradingPlan.findUnique({
      where: { id },
    });

    return found ? this.mapToDomainEntity(found) : null;
  }

  async findByUserId(userId: string): Promise<TradingPlan[]> {
    const plans = await prisma.tradingPlan.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return plans.map((plan: any) => this.mapToDomainEntity(plan));
  }

  async findByUserIdAndStatus(userId: string, status: PlanStatus): Promise<TradingPlan[]> {
    const plans = await prisma.tradingPlan.findMany({
      where: { 
        userId,
        status,
      },
      orderBy: { createdAt: 'desc' },
    });

    return plans.map((plan: any) => this.mapToDomainEntity(plan));
  }

  async update(plan: TradingPlan): Promise<TradingPlan> {
    const updated = await prisma.tradingPlan.update({
      where: { id: plan.id },
      data: {
        name: plan.name,
        description: plan.description,
        status: plan.status,
        updatedAt: plan.updatedAt,
        executedAt: plan.executedAt,
      },
    });

    return this.mapToDomainEntity(updated);
  }

  async delete(id: string): Promise<void> {
    await prisma.tradingPlan.delete({
      where: { id },
    });
  }

  private mapToDomainEntity(prismaPlan: any): TradingPlan {
    return new TradingPlan(
      prismaPlan.id,
      prismaPlan.userId,
      prismaPlan.name,
      prismaPlan.description,
      prismaPlan.status as PlanStatus,
      prismaPlan.entryPrice,
      prismaPlan.stopLoss,
      prismaPlan.takeProfit,
      prismaPlan.leverage,
      prismaPlan.positionType as PositionType,
      prismaPlan.riskPercentage,
      prismaPlan.accountBalance,
      prismaPlan.liquidationPrice,
      prismaPlan.positionSize,
      prismaPlan.marginRequired,
      prismaPlan.orderValue,
      prismaPlan.potentialProfit,
      prismaPlan.potentialLoss,
      prismaPlan.riskRewardRatio,
      prismaPlan.maxLossPercentage,
      prismaPlan.riskLevel as RiskLevel,
      prismaPlan.recommendations,
      prismaPlan.createdAt,
      prismaPlan.updatedAt,
      prismaPlan.executedAt,
    );
  }
}
