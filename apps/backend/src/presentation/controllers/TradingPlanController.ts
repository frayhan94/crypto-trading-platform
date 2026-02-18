import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { CreateTradingPlanUseCase } from '../../application/use-cases/CreateTradingPlan.js';
import { GetUserPlansUseCase } from '../../application/use-cases/GetUserPlans.js';
import { UpdatePlanStatusUseCase } from '../../application/use-cases/UpdatePlanStatus.js';
import { PrismaTradingPlanRepository } from '../../infrastructure/repositories/PrismaTradingPlanRepository.js';
import { PositionType, PlanStatus, RiskLevel } from '../../domain/entities/TradingPlan.js';
import { authMiddleware } from '../../middleware/auth.js';

export class TradingPlanController {
  private createPlanUseCase: CreateTradingPlanUseCase;
  private getUserPlansUseCase: GetUserPlansUseCase;
  private updatePlanStatusUseCase: UpdatePlanStatusUseCase;

  constructor() {
    const repository = new PrismaTradingPlanRepository();
    this.createPlanUseCase = new CreateTradingPlanUseCase(repository);
    this.getUserPlansUseCase = new GetUserPlansUseCase(repository);
    this.updatePlanStatusUseCase = new UpdatePlanStatusUseCase(repository);
  }

  getRoutes() {
    const routes = new Hono();

    // Apply auth middleware to all routeseaa
    routes.use('*', authMiddleware);

    const createPlanSchema = z.object({
      userId: z.string().min(1, 'User ID is required'),
      name: z.string().min(1, 'Plan name is required'),
      description: z.string().optional(),
      entryPrice: z.number().positive(),
      stopLoss: z.number().positive(),
      takeProfit: z.number().positive(),
      leverage: z.number().min(1).max(125),
      positionType: z.enum(['LONG', 'SHORT']),
      riskPercentage: z.number().min(0.1).max(100),
      accountBalance: z.number().positive(),
      liquidationPrice: z.number(),
      positionSize: z.number(),
      marginRequired: z.number(),
      orderValue: z.number(),
      potentialProfit: z.number(),
      potentialLoss: z.number(),
      riskRewardRatio: z.number(),
      maxLossPercentage: z.number(),
      riskLevel: z.enum(['LOW', 'MEDIUM', 'HIGH', 'EXTREME']),
      recommendations: z.array(z.string()).default([]),
    });

    const updatePlanSchema = z.object({
      status: z.enum(['DRAFT', 'ACTIVE', 'EXECUTED', 'CANCELLED']),
    });

    // Create a new trading plan
    routes.post('/', zValidator('json', createPlanSchema), async (c) => {
      const data = c.req.valid('json');
      const authUser = c.get('user');

      // Verify the authenticated user matches the userId in the request
      if (data.userId !== authUser.id) {
        return c.json({
          success: false,
          error: 'Unauthorized: You can only create plans for your own account',
        }, 403);
      }
      
      const result = await this.createPlanUseCase.execute({
        ...data,
        positionType: data.positionType as PositionType,
        riskLevel: data.riskLevel as RiskLevel,
      });
      
      if (result.success) {
        return c.json(result, 201);
      } else {
        return c.json(result, 400);
      }
    });

    // Get all plans for a user
    routes.get('/user/:userId', async (c) => {
      const userId = c.req.param('userId');
      const authUser = c.get('user');

      // Verify the authenticated user matches the requested userId
      if (userId !== authUser.id) {
        return c.json({
          success: false,
          error: 'Unauthorized: You can only view your own plans',
        }, 403);
      }
      
      const result = await this.getUserPlansUseCase.execute(userId);
      
      if (result.success) {
        return c.json(result);
      } else {
        return c.json(result, 400);
      }
    });

    // Update plan status
    routes.patch('/:id', zValidator('json', updatePlanSchema), async (c) => {
      const id = c.req.param('id');
      const data = c.req.valid('json');
      const authUser = c.get('user');

      // Verify the plan belongs to the authenticated user
      const repository = new PrismaTradingPlanRepository();
      const existingPlan = await repository.findById(id);
      
      if (!existingPlan) {
        return c.json({
          success: false,
          error: 'Trading plan not found',
        }, 404);
      }

      if (existingPlan.userId !== authUser.id) {
        return c.json({
          success: false,
          error: 'Unauthorized: You can only update your own plans',
        }, 403);
      }
      
      const result = await this.updatePlanStatusUseCase.execute(id, {
        status: data.status as PlanStatus,
      });
      
      if (result.success) {
        return c.json(result);
      } else {
        return c.json(result, 400);
      }
    });

    // Get a single plan by ID
    routes.get('/:id', async (c) => {
      const id = c.req.param('id');
      const authUser = c.get('user');
      
      const repository = new PrismaTradingPlanRepository();
      const plan = await repository.findById(id);
      
      if (!plan) {
        return c.json({
          success: false,
          error: 'Trading plan not found',
        }, 404);
      }

      // Verify the plan belongs to the authenticated user
      if (plan.userId !== authUser.id) {
        return c.json({
          success: false,
          error: 'Unauthorized: You can only view your own plans',
        }, 403);
      }

      return c.json({
        success: true,
        data: plan,
      });
    });

    // Delete a plan
    routes.delete('/:id', async (c) => {
      const id = c.req.param('id');
      const authUser = c.get('user');
      
      try {
        const repository = new PrismaTradingPlanRepository();
        const existingPlan = await repository.findById(id);
        
        if (!existingPlan) {
          return c.json({
            success: false,
            error: 'Trading plan not found',
          }, 404);
        }

        // Verify the plan belongs to the authenticated user
        if (existingPlan.userId !== authUser.id) {
          return c.json({
            success: false,
            error: 'Unauthorized: You can only delete your own plans',
          }, 403);
        }

        await repository.delete(id);

        return c.json({
          success: true,
          message: 'Trading plan deleted successfully',
        });
      } catch (error) {
        return c.json({
          success: false,
          error: 'Failed to delete trading plan',
        }, 500);
      }
    });

    // Get plans by status
    routes.get('/user/:userId/status/:status', async (c) => {
      const userId = c.req.param('userId');
      const status = c.req.param('status').toUpperCase();
      const authUser = c.get('user');

      // Verify the authenticated user matches the requested userId
      if (userId !== authUser.id) {
        return c.json({
          success: false,
          error: 'Unauthorized: You can only view your own plans',
        }, 403);
      }
      
      if (!['DRAFT', 'ACTIVE', 'EXECUTED', 'CANCELLED'].includes(status)) {
        return c.json({
          success: false,
          error: 'Invalid status',
        }, 400);
      }
      
      try {
        const repository = new PrismaTradingPlanRepository();
        const plans = await repository.findByUserIdAndStatus(userId, status as any);

        return c.json({
          success: true,
          data: plans,
        });
      } catch (error) {
        return c.json({
          success: false,
          error: 'Failed to fetch trading plans',
        }, 500);
      }
    });

    return routes;
  }
}
