# 🚀 Crypto Trading Platform

A comprehensive cryptocurrency trading platform built as a monorepo with Next.js frontend and Hono backend.

## 📁 Project Structure

```
crypto-trading-platform/
├── apps/
│   ├── frontend/          # Next.js frontend application
│   └── backend/           # Hono API server
├── packages/
│   ├── types/             # Shared TypeScript types
│   └── utils/             # Shared utility functions
├── package.json           # Root package.json with workspaces
├── pnpm-workspace.yaml    # pnpm workspace configuration
└── turbo.json             # Turborepo build configuration
```

## 🛠️ Tech Stack

### Frontend (`apps/frontend`)
- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Forms**: React Hook Form + Zod validation
- **State**: React hooks

### Backend (`apps/backend`)
- **Framework**: Hono (lightweight, fast)
- **Runtime**: Node.js
- **Language**: TypeScript
- **Validation**: Zod

### Shared Packages
- **@repo/types**: Shared TypeScript interfaces and types
- **@repo/utils**: Common utility functions (formatting, calculations)

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- pnpm 8+

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd crypto-trading-platform

# Install dependencies
pnpm install

# Start development servers (both frontend and backend)
pnpm dev
```

### Development Commands

```bash
# Run all apps in development mode
pnpm dev

# Run only frontend
pnpm dev:frontend

# Run only backend
pnpm dev:backend

# Build all apps
pnpm build

# Type check all packages
pnpm type-check

# Lint all packages
pnpm lint

# Clean all build outputs
pnpm clean
```

## 🌐 API Endpoints

### Backend API (http://localhost:3001)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | API info |
| GET | `/api/health` | Health check |
| GET | `/api/health/ready` | Readiness check |
| POST | `/api/risk/analyze` | Analyze trading risk |
| POST | `/api/risk/liquidation` | Calculate liquidation price |
| POST | `/api/risk/position-size` | Calculate position size |
| GET | `/api/risk/recommendations` | Get risk recommendations |

### Example: Analyze Risk

```bash
curl -X POST http://localhost:3001/api/risk/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "entryPrice": 50000,
    "stopLoss": 48000,
    "takeProfit": 55000,
    "balance": 10000,
    "accountBalance": 10000,
    "leverage": 5,
    "riskPercentage": 2,
    "positionType": "long"
  }'
```

## ✨ Features

### 🧮 Risk Management Tools
- Liquidation price calculation
- Position sizing based on risk percentage
- Risk/reward ratio analysis
- Scenario simulations (Stop Loss, Take Profit, Liquidation)

### 💰 Professional Trading Interface
- Currency formatting with thousands separators
- Real-time form validation
- Custom modal system
- Responsive design

### 🛡️ Enterprise Features
- Error boundaries
- Type safety with TypeScript
- API validation with Zod
- CORS configuration

## 📦 Workspace Packages

### @repo/types
Shared TypeScript types used across frontend and backend:
- `TradingParameters`, `TradingParams`
- `RiskCalculations`, `RiskAnalysis`
- `SimulationResult`, `ValidationError`
- API response types

### @repo/utils
Shared utility functions:
- `formatCurrency`, `parseCurrency`
- `formatPercentage`, `formatNumber`
- `calculateLiquidationPrice`, `calculatePositionSize`
- Validation helpers

## 🔧 Configuration

### Environment Variables

Create `.env.local` files in each app:

**apps/frontend/.env.local**
```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
```

**apps/backend/.env.local**
```bash
PORT=3001
NODE_ENV=development
```

## 🚀 Deployment

### Frontend (Vercel)
```bash
cd apps/frontend
vercel
```

### Backend (Any Node.js host)
```bash
cd apps/backend
pnpm build
pnpm start
```

## 📄 License

MIT License

---

**Built with ❤️ for professional cryptocurrency traders**
