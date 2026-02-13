import { TradingPlanRepository } from '../../domain/repositories/TradingPlanRepository';
import { PrismaTradingPlanRepository } from '../repositories/PrismaTradingPlanRepository';

export class DIContainer {
  private static repositories: Map<string, any> = new Map();

  static getTradingPlanRepository(): TradingPlanRepository {
    if (!this.repositories.has('tradingPlan')) {
      this.repositories.set('tradingPlan', new PrismaTradingPlanRepository());
    }
    return this.repositories.get('tradingPlan');
  }

  static reset(): void {
    this.repositories.clear();
  }
}
