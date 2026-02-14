# Crypto Trading Platform - Backend API

REST API for the Crypto Trading Platform built with **Hono**, **Prisma**, and **PostgreSQL** (Supabase).

## Tech Stack

- **Runtime**: Node.js (ES Modules)
- **Framework**: [Hono](https://hono.dev/) - Lightweight web framework
- **ORM**: [Prisma](https://www.prisma.io/) 5.22.0
- **Database**: PostgreSQL (Supabase)
- **Validation**: Zod
- **Language**: TypeScript
- **Deployment**: Vercel

## Architecture

The backend follows **Domain-Driven Design (DDD)** with a clean architecture approach:

```
src/
├── domain/                  # Core business logic (no external dependencies)
│   ├── entities/            # Domain entities (TradingPlan)
│   ├── repositories/        # Repository interfaces
│   ├── services/            # Domain services (RiskCalculationService)
│   └── value-objects/       # Value objects (Money, Percentage)
├── application/             # Application layer (use cases & DTOs)
│   ├── dtos/                # Data Transfer Objects
│   └── use-cases/           # Business use cases
├── infrastructure/          # External services implementation
│   ├── di/                  # Dependency injection container
│   ├── lib/                 # Shared libraries (Prisma client)
│   └── repositories/        # Prisma repository implementations
├── presentation/            # HTTP layer
│   └── controllers/         # Route controllers
├── routes/                  # Route definitions
│   └── v1/                  # API v1 routes
└── index.ts                 # App entry point
```

## Getting Started

### Prerequisites

- Node.js >= 18
- pnpm
- PostgreSQL database (Supabase recommended)

### Setup

1. **Install dependencies** (from project root):
   ```bash
   pnpm install
   ```

2. **Configure environment variables**:
   ```bash
   cp .env.example .env
   ```
   Update `.env` with your Supabase database connection string:
   ```
   DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"
   ```

3. **Generate Prisma Client**:
   ```bash
   pnpm prisma generate
   ```

4. **Push database schema**:
   ```bash
   pnpm prisma db push
   ```

5. **Start development server**:
   ```bash
   pnpm dev
   ```

The API will be available at `http://localhost:3001`.

## API Endpoints

### Base URL

- **Local**: `http://localhost:3001`
- **Production**: Deployed on Vercel

### Root

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/`      | API info and available versions |

### V1 - Trading Plans (`/api/v1/plans`)

| Method | Endpoint                              | Description                  |
|--------|---------------------------------------|------------------------------|
| POST   | `/api/v1/plans`                       | Create a new trading plan    |
| GET    | `/api/v1/plans/:id`                   | Get a plan by ID             |
| GET    | `/api/v1/plans/user/:userId`          | Get all plans for a user     |
| GET    | `/api/v1/plans/user/:userId/status/:status` | Get plans by user and status |
| PATCH  | `/api/v1/plans/:id`                   | Update plan status           |
| DELETE | `/api/v1/plans/:id`                   | Delete a plan                |

### Request/Response Examples

#### Create Trading Plan

```bash
curl -X POST http://localhost:3001/api/v1/plans \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-123",
    "name": "BTC Long Position",
    "description": "Bitcoin long with 10x leverage",
    "entryPrice": 50000,
    "stopLoss": 48000,
    "takeProfit": 55000,
    "leverage": 10,
    "positionType": "LONG",
    "riskPercentage": 2,
    "accountBalance": 10000,
    "liquidationPrice": 45000,
    "positionSize": 0.02,
    "marginRequired": 100,
    "orderValue": 1000,
    "potentialProfit": 100,
    "potentialLoss": 40,
    "riskRewardRatio": 2.5,
    "maxLossPercentage": 2,
    "riskLevel": "MEDIUM"
  }'
```

#### Get User Plans

```bash
curl http://localhost:3001/api/v1/plans/user/user-123
```

#### Update Plan Status

```bash
curl -X PATCH http://localhost:3001/api/v1/plans/<plan-id> \
  -H "Content-Type: application/json" \
  -d '{"status": "ACTIVE"}'
```

### Plan Status Values

| Status      | Description                        |
|-------------|------------------------------------|
| `DRAFT`     | Plan created but not yet active    |
| `ACTIVE`    | Plan is currently being executed   |
| `EXECUTED`  | Plan has been fully executed       |
| `CANCELLED` | Plan has been cancelled            |

### Risk Levels

| Level    | Description                              |
|----------|------------------------------------------|
| `LOW`    | Max loss ≤ 2%, risk-reward ≥ 1.5         |
| `MEDIUM` | Max loss ≤ 5%, risk-reward ≥ 1.0         |
| `HIGH`   | Max loss ≤ 10%, risk-reward ≥ 0.5        |
| `EXTREME` | Max loss > 10% or risk-reward < 0.5     |

## Database Schema

The database uses a single `TradingPlan` model with trading parameters and calculated risk metrics. See `prisma/schema.prisma` for the full schema definition.

## Scripts

| Script           | Description                          |
|------------------|--------------------------------------|
| `pnpm dev`       | Start dev server with hot reload     |
| `pnpm build`     | Generate Prisma Client and compile   |
| `pnpm start`     | Run compiled production build        |
| `pnpm type-check`| Run TypeScript type checking         |
| `pnpm lint`      | Run ESLint                           |
| `pnpm clean`     | Remove dist folder                   |

## Deployment

The backend is deployed to **Vercel** as a serverless function. The `vercel.json` configuration handles routing and build commands.

### Environment Variables on Vercel

Set the following in your Vercel project settings:

- `DATABASE_URL` - Supabase PostgreSQL connection string
