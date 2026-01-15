# Financial Modeling Platform

A comprehensive SaaS platform for financial modeling, valuation analysis, and deal execution. Built with Python/FastAPI backend, React/TypeScript frontend, and Excel Add-in integration.

## Features

### Financial Models
- **3-Statement Models** - Integrated Income Statement, Balance Sheet, Cash Flow
- **Operating Models** - Revenue build, cost structure, margin analysis
- **13-Week Cash Flow** - Short-term liquidity forecasting
- **LBO Models** - Leveraged buyout with IRR/MOIC calculations
- **Merger Models** - M&A accretion/dilution analysis
- **Industry-Specific** - Sale-leaseback, REIT conversion, NAV models

### Valuation Analysis
- **DCF Valuation** - Discounted cash flow with WACC build
- **Trading Comps** - Comparable company analysis
- **Precedent Transactions** - Historical deal multiples
- **Football Field** - Visual valuation summary

### Platform Capabilities
- **Real-time Collaboration** - WebSocket-based multi-user editing
- **Scenario Management** - Base, Bull, Bear, Management cases
- **Version Control** - Git-like model versioning
- **Role-Based Access** - Analyst, Stakeholder, Admin roles
- **Excel Integration** - Full Office.js add-in with custom functions
- **Export** - PDF and PowerPoint generation

## Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | Python 3.11+, FastAPI, SQLAlchemy |
| Database | PostgreSQL, Redis |
| Frontend | React 18, TypeScript, Redux Toolkit |
| UI Components | AG Grid, Recharts, Visx |
| Excel | Office.js Add-in |
| Real-time | WebSocket |

## Project Structure

```
micro1/
├── backend/                    # Python FastAPI backend
│   ├── app/                    # Application config
│   │   ├── main.py            # FastAPI entry point
│   │   └── config.py          # Settings management
│   ├── api/v1/                # REST API endpoints
│   │   ├── models/            # Financial model CRUD
│   │   ├── valuations/        # DCF, Comps, Precedents
│   │   └── deals/             # LBO, M&A analysis
│   ├── core/                  # Business logic
│   │   ├── engine/            # Calculation engine
│   │   │   ├── base_model.py  # Abstract financial model
│   │   │   └── calculation_graph.py  # Dependency DAG
│   │   └── models/            # Model implementations
│   │       └── lbo_model.py   # LBO with returns
│   ├── db/models/             # SQLAlchemy models
│   ├── services/              # Business services
│   └── tests/                 # pytest test suite
│
├── frontend/                   # React TypeScript frontend
│   ├── src/
│   │   ├── app/               # App configuration
│   │   │   ├── store/         # Redux Toolkit
│   │   │   └── providers/     # RBAC, WebSocket
│   │   ├── features/          # Feature modules
│   │   │   ├── dashboard/     # Executive dashboard
│   │   │   ├── model-builder/ # Analyst interface
│   │   │   ├── deal-analysis/ # LBO analysis
│   │   │   └── valuation/     # Valuation suite
│   │   └── shared/            # Shared components
│   └── package.json
│
└── excel-addin/               # Office.js Excel Add-in
    ├── src/
    │   ├── functions/         # Custom functions (UDFs)
    │   └── sync/              # Sync engine
    └── manifest.xml
```

## Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL 14+ (optional for Phase 1)
- Redis (optional for Phase 1)

### Backend Setup

```bash
# Navigate to backend
cd backend

# Create virtual environment (recommended)
python -m venv venv
source venv/bin/activate  # Linux/Mac
# or: venv\Scripts\activate  # Windows

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your settings

# Run development server
uvicorn app.main:app --reload --port 8001
```

### Frontend Setup

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

### Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8001
- **API Docs**: http://localhost:8001/docs

## API Endpoints

### Financial Models

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/models/` | Create new model |
| GET | `/api/v1/models/{id}` | Get model by ID |
| PUT | `/api/v1/models/{id}/cells` | Batch update cells |
| POST | `/api/v1/models/{id}/calculate` | Trigger recalculation |

### LBO Analysis

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/models/lbo/analyze` | Run LBO analysis |
| POST | `/api/v1/models/lbo/sensitivity` | Sensitivity analysis |

### Valuations

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/valuations/dcf` | DCF valuation |
| POST | `/api/v1/valuations/comps` | Trading comparables |
| POST | `/api/v1/valuations/precedents` | Precedent transactions |

### Deal Analysis

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/deals/merger/accretion` | M&A accretion/dilution |
| POST | `/api/v1/deals/spinoff` | Spin-off analysis |
| POST | `/api/v1/deals/contribution` | Contribution analysis |

## Example Usage

### LBO Analysis

```bash
curl -X POST http://localhost:8001/api/v1/models/lbo/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "enterprise_value": 500,
    "equity_purchase_price": 450,
    "senior_debt_amount": 250,
    "senior_debt_rate": 0.06,
    "sponsor_equity": 200,
    "projection_years": 5,
    "revenue_base": 300,
    "revenue_growth_rates": [0.05, 0.05, 0.05, 0.05, 0.05],
    "ebitda_margins": [0.20, 0.21, 0.22, 0.22, 0.23],
    "exit_year": 5,
    "exit_multiple": 8.0
  }'
```

**Response:**
```json
{
  "success": true,
  "outputs": {
    "irr": 0.243,
    "moic": 2.97,
    "entry_ev_ebitda": 8.3,
    "exit_equity_value": 593685,
    "sources": {
      "Senior Debt": 250,
      "Sponsor Equity": 200
    },
    "uses": {
      "Equity Purchase Price": 450
    }
  }
}
```

### DCF Valuation

```bash
curl -X POST http://localhost:8001/api/v1/valuations/dcf \
  -H "Content-Type: application/json" \
  -d '{
    "projection_years": 5,
    "free_cash_flows": [50, 55, 60, 66, 72],
    "risk_free_rate": 0.04,
    "equity_risk_premium": 0.055,
    "beta": 1.1,
    "cost_of_debt": 0.05,
    "tax_rate": 0.25,
    "debt_weight": 0.30,
    "terminal_growth_rate": 0.025,
    "net_debt": 100,
    "shares_outstanding": 20
  }'
```

**Response:**
```json
{
  "wacc": 0.082,
  "cost_of_equity": 0.101,
  "present_value_fcf": 237.5,
  "terminal_value": 1303.9,
  "enterprise_value": 1118.4,
  "equity_value": 1018.4,
  "equity_value_per_share": 50.92
}
```

## Testing

### Backend Tests

```bash
cd backend

# Run all tests
pytest tests/ -v

# Run specific test file
pytest tests/test_lbo_model.py -v

# Run with coverage
pytest tests/ --cov=core --cov-report=html
```

### Frontend Tests

```bash
cd frontend

# Run tests
npm test

# Run with coverage
npm run test:coverage
```

## Excel Add-in Custom Functions

The Excel add-in provides custom functions for platform integration:

| Function | Description | Example |
|----------|-------------|---------|
| `=FP.GET(model, cell)` | Fetch value from platform | `=FP.GET("LBO/Deal1", "IRR")` |
| `=FP.LINK(model, cell)` | Bidirectional link | `=FP.LINK("DCF/Base", "WACC")` |
| `=FP.SCENARIO(name, cell)` | Scenario-specific value | `=FP.SCENARIO("Bear", B5)` |
| `=FP.LIVE(source, id, field)` | Streaming data | `=FP.LIVE("market", "AAPL", "price")` |
| `=FP.SENSITIVITY(in, out, steps)` | Sensitivity table | `=FP.SENSITIVITY(B2, C10, 10)` |

## Development Roadmap

### Phase 1: Foundation (Completed)
- [x] Project structure setup
- [x] FastAPI backend with core endpoints
- [x] Calculation engine with dependency graph
- [x] LBO model with IRR/MOIC
- [x] DCF, Comps, Precedents endpoints
- [x] M&A accretion/dilution
- [x] React frontend with TypeScript
- [x] Redux state management
- [x] Dashboard, Model Builder, Valuation UI
- [x] Excel add-in foundation
- [x] Unit tests (13 passing)

### Phase 2: Database Integration (Next)
- [ ] Alembic migrations
- [ ] User authentication (JWT)
- [ ] Model CRUD with PostgreSQL
- [ ] Version control system

### Phase 3: Real-time Collaboration
- [ ] WebSocket implementation
- [ ] Presence awareness
- [ ] Conflict resolution
- [ ] Comments and annotations

### Phase 4: Additional Models
- [ ] 3-statement model
- [ ] Operating model
- [ ] 13-week cash flow
- [ ] Sale-leaseback
- [ ] REIT conversion
- [ ] NAV model

### Phase 5: Export & Reporting
- [ ] PDF generation
- [ ] PowerPoint export
- [ ] Print-optimized layouts
- [ ] Template system

### Phase 6: Excel Add-in Completion
- [ ] Full sync engine
- [ ] Offline support
- [ ] Custom function streaming
- [ ] Task pane UI

## Environment Variables

```env
# Application
APP_NAME="Financial Modeling Platform"
DEBUG=true

# Database
DATABASE_URL=postgresql+asyncpg://user:pass@localhost:5432/finmodel

# Redis
REDIS_URL=redis://localhost:6379/0

# Authentication
SECRET_KEY=your-secret-key
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Storage (S3/MinIO)
S3_ENDPOINT_URL=
S3_ACCESS_KEY=
S3_SECRET_KEY=
S3_BUCKET_NAME=finmodel-storage
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-model`)
3. Commit changes (`git commit -m 'Add new model'`)
4. Push to branch (`git push origin feature/new-model`)
5. Open a Pull Request

## License

MIT License - see LICENSE file for details.

---

**Current Status**: Phase 1 Complete - Foundation operational with LBO, DCF, M&A analysis working end-to-end.
