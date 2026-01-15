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
- **Bespoke Transactions** - Spin-off/carve-out, IP licensing, Reverse Morris Trust
- **Due Diligence** - Vertical-specific workflows, findings tracker, risk matrix, QoE analysis

### Valuation Analysis
- **DCF Valuation** - Discounted cash flow with WACC build
- **Trading Comps** - Comparable company analysis
- **Precedent Transactions** - Historical deal multiples
- **Football Field** - Visual valuation summary

### Platform Capabilities
- **User Authentication** - JWT-based authentication with role-based access
- **Real-time Collaboration** - WebSocket-based multi-user editing with presence awareness
- **Comments & Annotations** - Threaded comments on cells with resolution tracking
- **Cell Locking** - Prevent edit conflicts with automatic cell-level locks
- **Scenario Management** - Base, Bull, Bear, Management cases
- **Version Control** - Git-like model versioning
- **Role-Based Access** - Analyst, Stakeholder, Admin roles
- **Excel Integration** - Full Office.js add-in with custom functions
- **Export** - PDF and PowerPoint generation

## Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | Python 3.11+, FastAPI, SQLAlchemy |
| Database | PostgreSQL 14+, Redis |
| Auth | JWT (python-jose), bcrypt |
| Migrations | Alembic |
| Real-time | WebSocket (native) |
| Frontend | React 18, TypeScript, Redux Toolkit |
| UI Components | AG Grid, Recharts, Visx |
| Excel | Office.js Add-in |

## Project Structure

```
micro1/
├── backend/                    # Python FastAPI backend
│   ├── app/                    # Application config
│   │   ├── main.py            # FastAPI entry point
│   │   ├── config.py          # Settings management
│   │   └── dependencies.py    # Auth dependencies
│   ├── api/v1/                # REST API endpoints
│   │   ├── auth/              # Authentication endpoints
│   │   ├── collaboration/     # WebSocket & comments
│   │   ├── models/            # Financial model CRUD
│   │   ├── valuations/        # DCF, Comps, Precedents
│   │   ├── deals/             # LBO, M&A analysis
│   │   ├── exports/           # PDF and PowerPoint export
│   │   ├── excel/             # Excel add-in sync API
│   │   ├── industry/          # Industry-specific models
│   │   ├── bespoke/           # Bespoke transaction models
│   │   └── due_diligence/     # Due diligence workflows
│   ├── core/                  # Business logic
│   │   ├── engine/            # Calculation engine
│   │   │   ├── base_model.py  # Abstract financial model
│   │   │   ├── calculation_graph.py  # Dependency DAG
│   │   │   └── scenario_manager.py  # Scenario management
│   │   └── models/            # Model implementations
│   │       ├── lbo_model.py   # LBO with returns
│   │       ├── three_statement.py  # 3-statement model
│   │       ├── operating_model.py  # Operating model
│   │       ├── cash_flow_13week.py  # 13-week cash flow
│   │       ├── sale_leaseback.py  # Sale-leaseback transactions
│   │       ├── reit_model.py  # REIT valuation
│   │       ├── nav_model.py  # NAV/sum-of-the-parts
│   │       ├── spinoff_model.py  # Spin-off/carve-out
│   │       ├── ip_licensing_model.py  # IP licensing
│   │       ├── rmt_model.py  # Reverse Morris Trust
│   │       └── due_diligence.py  # Due diligence workflows
│   ├── db/models/             # SQLAlchemy models
│   ├── alembic/               # Database migrations
│   ├── services/              # Business services
│   │   ├── auth_service.py    # Authentication logic
│   │   ├── model_service.py   # Model CRUD operations
│   │   ├── websocket_manager.py  # WebSocket connections
│   │   ├── collaboration_service.py  # Comments/annotations
│   │   ├── pdf_service.py     # PDF report generation
│   │   ├── pptx_service.py    # PowerPoint generation
│   │   └── report_templates.py  # Template management
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
│   │   │   ├── valuation/     # Valuation suite
│   │   │   └── due-diligence/ # Due diligence workflow
│   │   │       ├── DueDiligence.tsx      # Main DD page
│   │   │       ├── types.ts              # DD types
│   │   │       ├── services/             # API service
│   │   │       └── components/           # DD components
│   │   │           ├── FindingsTracker.tsx
│   │   │           ├── RiskMatrix.tsx
│   │   │           ├── QoECalculator.tsx
│   │   │           ├── DDChecklist.tsx
│   │   │           └── DDSummary.tsx
│   │   └── shared/            # Shared components
│   └── package.json
│
└── excel-addin/               # Office.js Excel Add-in
    ├── src/
    │   ├── functions/         # Custom functions (UDFs)
    │   │   └── platformFunctions.ts  # FP.GET, FP.LINK, FP.LIVE, etc.
    │   ├── sync/              # Sync engine
    │   │   └── SyncEngine.ts  # WebSocket sync with conflict resolution
    │   ├── offline/           # Offline storage
    │   │   └── IndexedDBStore.ts  # IndexedDB for offline support
    │   └── taskpane/          # Task pane UI
    │       ├── components/    # React components
    │       │   ├── App.tsx    # Main app component
    │       │   ├── Header.tsx # Header with status
    │       │   ├── LoginDialog.tsx  # Authentication dialog
    │       │   └── tabs/      # Tab components
    │       │       ├── HomeTab.tsx
    │       │       ├── LinksTab.tsx
    │       │       ├── SyncTab.tsx
    │       │       └── SettingsTab.tsx
    │       └── index.tsx      # Entry point
    └── manifest.xml
```

## Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL 14+
- Docker (optional, for PostgreSQL)

### Database Setup

```bash
# Using Docker
docker run -d \
  --name finmodel-postgres \
  -e POSTGRES_PASSWORD=yourpassword \
  -p 5432:5432 \
  postgres:14

# Create database
docker exec -it finmodel-postgres psql -U postgres -c "CREATE DATABASE finmodel;"
```

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
# Edit .env with your database credentials

# Run database migrations
alembic upgrade head

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
- **WebSocket**: ws://localhost:8001/ws/models/{model_id}

## API Endpoints

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/v1/auth/register` | Register new user | No |
| POST | `/api/v1/auth/login` | Login and get tokens | No |
| POST | `/api/v1/auth/refresh` | Refresh access token | No |
| POST | `/api/v1/auth/logout` | Logout and revoke token | No |
| GET | `/api/v1/auth/me` | Get current user profile | Yes |
| PUT | `/api/v1/auth/me` | Update user profile | Yes |
| POST | `/api/v1/auth/change-password` | Change password | Yes |

### Financial Models

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/v1/models/` | Create new model | Yes |
| GET | `/api/v1/models/` | List user's models | Yes |
| GET | `/api/v1/models/{id}` | Get model by ID | Yes |
| PUT | `/api/v1/models/{id}` | Update model | Yes |
| DELETE | `/api/v1/models/{id}` | Delete (archive) model | Yes |
| PUT | `/api/v1/models/{id}/cells` | Batch update cells | Yes |
| POST | `/api/v1/models/{id}/calculate` | Trigger recalculation | Yes |

### Collaboration

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| WS | `/ws/models/{id}` | Real-time WebSocket connection | Yes (token param) |
| POST | `/api/v1/collaboration/comments` | Create comment | Yes |
| GET | `/api/v1/collaboration/comments` | Get comments for model | Yes |
| PUT | `/api/v1/collaboration/comments/{id}` | Update/resolve comment | Yes |
| DELETE | `/api/v1/collaboration/comments/{id}` | Delete comment | Yes |
| POST | `/api/v1/collaboration/annotations` | Create annotation | Yes |
| GET | `/api/v1/collaboration/annotations` | Get annotations | Yes |
| DELETE | `/api/v1/collaboration/annotations/{id}` | Delete annotation | Yes |
| GET | `/api/v1/collaboration/presence/{model_id}` | Get active users | Yes |

### LBO Analysis

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/v1/models/lbo/analyze` | Run LBO analysis | No |
| POST | `/api/v1/models/lbo/sensitivity` | Sensitivity analysis | No |

### Valuations

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/v1/valuations/dcf` | DCF valuation | No |
| POST | `/api/v1/valuations/comps` | Trading comparables | No |
| POST | `/api/v1/valuations/precedents` | Precedent transactions | No |

### Deal Analysis

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/v1/deals/merger/accretion` | M&A accretion/dilution | No |
| POST | `/api/v1/deals/spinoff` | Spin-off analysis | No |
| POST | `/api/v1/deals/contribution` | Contribution analysis | No |

### Industry-Specific Models

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/v1/industry/sale-leaseback/analyze` | Sale-leaseback transaction analysis | No |
| POST | `/api/v1/industry/sale-leaseback/sensitivity` | Sale-leaseback sensitivity | No |
| POST | `/api/v1/industry/reit/analyze` | REIT valuation and metrics | No |
| POST | `/api/v1/industry/reit/ffo-affo` | FFO/AFFO calculation | No |
| POST | `/api/v1/industry/reit/sensitivity` | REIT sensitivity analysis | No |
| POST | `/api/v1/industry/nav/analyze` | Net Asset Value calculation | No |
| POST | `/api/v1/industry/nav/sotp` | Sum-of-the-parts breakdown | No |
| POST | `/api/v1/industry/nav/sensitivity` | NAV sensitivity analysis | No |

### Bespoke Transactions

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/v1/bespoke/spinoff/analyze` | Spin-off/carve-out analysis | No |
| POST | `/api/v1/bespoke/spinoff/value-creation` | Value creation calculation | No |
| POST | `/api/v1/bespoke/ip-licensing/analyze` | IP licensing analysis | No |
| POST | `/api/v1/bespoke/ip-licensing/valuation` | IP license valuation | No |
| POST | `/api/v1/bespoke/rmt/analyze` | Reverse Morris Trust analysis | No |
| POST | `/api/v1/bespoke/rmt/tax-analysis` | RMT tax implications | No |
| POST | `/api/v1/bespoke/rmt/accretion-dilution` | RMT accretion/dilution | No |

### Due Diligence

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/v1/due-diligence/analyze` | Comprehensive DD analysis | No |
| POST | `/api/v1/due-diligence/checklist/{vertical}` | Vertical-specific checklist | No |
| POST | `/api/v1/due-diligence/qoe` | Quality of Earnings analysis | No |
| POST | `/api/v1/due-diligence/risk-matrix` | Risk matrix calculation | No |
| POST | `/api/v1/due-diligence/findings/summarize` | Summarize DD findings | No |
| POST | `/api/v1/due-diligence/recommendations` | Get DD recommendations | No |
| GET | `/api/v1/due-diligence/verticals` | List available verticals | No |
| GET | `/api/v1/due-diligence/categories` | List finding categories | No |
| GET | `/api/v1/due-diligence/severities` | List severity levels | No |

### Export & Reports

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/v1/export/pdf/lbo` | Generate LBO PDF report | No |
| POST | `/api/v1/export/pdf/three-statement` | Generate 3-statement PDF | No |
| POST | `/api/v1/export/pdf/13-week-cash-flow` | Generate 13-week CF PDF | No |
| POST | `/api/v1/export/pdf/custom` | Generate custom PDF report | No |
| POST | `/api/v1/export/pptx/lbo` | Generate LBO presentation | No |
| POST | `/api/v1/export/pptx/valuation` | Generate valuation deck | No |
| POST | `/api/v1/export/pptx/scenario-comparison` | Generate scenario comparison | No |
| POST | `/api/v1/export/pptx/custom` | Generate custom presentation | No |
| GET | `/api/v1/export/templates` | List report templates | No |
| GET | `/api/v1/export/templates/{id}` | Get template details | No |
| POST | `/api/v1/export/templates` | Create custom template | No |
| DELETE | `/api/v1/export/templates/{id}` | Delete template | No |
| POST | `/api/v1/export/templates/{id}/clone` | Clone template | No |

### Excel Add-in API

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/v1/excel/get-value` | Fetch value from model | No |
| POST | `/api/v1/excel/create-link` | Create bidirectional link | No |
| POST | `/api/v1/excel/scenario-value` | Get scenario-specific value | No |
| POST | `/api/v1/excel/sync` | Sync cell change | No |
| POST | `/api/v1/excel/sync-batch` | Batch sync operations | No |
| POST | `/api/v1/excel/sensitivity` | Calculate sensitivity matrix | No |
| POST | `/api/v1/excel/audit` | Get cell audit info | No |
| POST | `/api/v1/excel/comments` | Get cell comments | No |
| POST | `/api/v1/excel/unlink` | Remove cell link | No |
| GET | `/api/v1/excel/links/{client_id}` | Get client's linked cells | No |
| WS | `/api/v1/excel/ws` | Real-time Excel sync WebSocket | No |

## Real-time Collaboration

### WebSocket Connection

Connect to the WebSocket endpoint with your access token:

```javascript
const ws = new WebSocket(
  `ws://localhost:8001/ws/models/${modelId}?token=${accessToken}`
);

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  console.log('Received:', message.type, message.payload);
};
```

### WebSocket Message Types

| Type | Direction | Description |
|------|-----------|-------------|
| `join` | Server→Client | User joined the model |
| `leave` | Server→Client | User left the model |
| `presence` | Server→Client | Current users list |
| `cursor` | Bidirectional | Cursor/cell position update |
| `cell_lock` | Bidirectional | Lock a cell for editing |
| `cell_unlock` | Bidirectional | Release cell lock |
| `cell_update` | Bidirectional | Cell value changed |
| `comment_add` | Bidirectional | New comment added |
| `comment_update` | Bidirectional | Comment updated |
| `comment_delete` | Bidirectional | Comment deleted |
| `ping`/`pong` | Bidirectional | Keep-alive |
| `error` | Server→Client | Error message |

### Example: Cell Locking

```javascript
// Request cell lock before editing
ws.send(JSON.stringify({
  type: 'cell_lock',
  payload: { cell: 'B5' }
}));

// Listen for lock confirmation or error
ws.onmessage = (event) => {
  const msg = JSON.parse(event.data);
  if (msg.type === 'cell_lock') {
    console.log(`Cell ${msg.payload.cell} locked by ${msg.payload.user_name}`);
  } else if (msg.type === 'error' && msg.payload.code === 'CELL_LOCKED') {
    console.log('Cell is already locked by another user');
  }
};

// Release lock when done editing
ws.send(JSON.stringify({
  type: 'cell_unlock',
  payload: { cell: 'B5' }
}));
```

## Example Usage

### User Registration & Login

```bash
# Register a new user
curl -X POST http://localhost:8001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "analyst@example.com",
    "password": "securepassword123",
    "name": "John Analyst"
  }'

# Login to get access token
curl -X POST http://localhost:8001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "analyst@example.com",
    "password": "securepassword123"
  }'
```

### Creating Comments

```bash
# Add a comment on a cell
curl -X POST http://localhost:8001/api/v1/collaboration/comments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "model_id": "3c33cfb4-eb13-4e9b-bfb3-5c7bd77852ee",
    "content": "This assumption needs review",
    "cell_address": "B5"
  }'
```

**Response:**
```json
{
  "id": "9a67acd8-80f2-4df7-93a0-a78b58c09f24",
  "model_id": "3c33cfb4-eb13-4e9b-bfb3-5c7bd77852ee",
  "cell_address": "B5",
  "user_name": "John Analyst",
  "content": "This assumption needs review",
  "is_resolved": false,
  "created_at": "2025-01-15T01:01:35.108815+00:00"
}
```

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

## Testing

### Backend Tests

```bash
cd backend

# Run all tests (166 tests)
pytest tests/ -v

# Run specific test file
pytest tests/test_lbo_model.py -v
pytest tests/test_auth.py -v
pytest tests/test_websocket.py -v
pytest tests/test_financial_models.py -v
pytest tests/test_export.py -v
pytest tests/test_excel_api.py -v
pytest tests/test_industry_models.py -v
pytest tests/test_bespoke_models.py -v
pytest tests/test_due_diligence.py -v

# Run with coverage
pytest tests/ --cov=core --cov=services --cov-report=html
```

### Frontend Tests

```bash
cd frontend

# Run tests
npm test

# Run with coverage
npm run test:coverage
```

## Database Migrations

```bash
cd backend

# Create a new migration
alembic revision --autogenerate -m "Description of changes"

# Apply migrations
alembic upgrade head

# Rollback one migration
alembic downgrade -1

# View migration history
alembic history
```

## Excel Add-in Custom Functions

The Excel add-in provides custom functions for platform integration:

| Function | Description | Example |
|----------|-------------|---------|
| `=FP.GET(model, cell, [version])` | Fetch value from platform | `=FP.GET("LBO/Deal1", "IRR")` |
| `=FP.LINK(model, cell)` | Bidirectional sync link | `=FP.LINK("DCF/Base", "WACC")` |
| `=FP.SCENARIO(name, cell)` | Scenario-specific value | `=FP.SCENARIO("Bear_Case", "B5")` |
| `=FP.LIVE(source, id, field)` | Streaming real-time data | `=FP.LIVE("market", "AAPL", "price")` |
| `=FP.SENSITIVITY(in, out, steps)` | Sensitivity analysis table | `=FP.SENSITIVITY("B2", "C10", 10)` |
| `=FP.AUDIT(cell, field)` | Get audit information | `=FP.AUDIT("B5", "last_modified_by")` |
| `=FP.COMMENT(cell)` | Get latest comment | `=FP.COMMENT("B5")` |

### Function Details

#### FP.GET - Fetch Value
```excel
=FP.GET("Portfolio/CompanyA/DCF", "IRR")
=FP.GET("LBO/Deal1", "B5", 2)  // Specific version
```
Retrieves a value from the platform. Values are cached for offline access.

#### FP.LINK - Bidirectional Link
```excel
=FP.LINK("Portfolio/CompanyA/Model", "WACC")
```
Creates a bidirectional sync between the Excel cell and platform. Changes in either location are synchronized.

#### FP.SCENARIO - Scenario Values
```excel
=FP.SCENARIO("Base_Case", "Revenue")
=FP.SCENARIO("Bull_Case", "EBITDA")
=FP.SCENARIO("Stress_Test", "Cash_Balance")
```
Gets values from specific scenarios (Base, Upside, Downside, Stress).

#### FP.LIVE - Streaming Data
```excel
=FP.LIVE("market", "AAPL", "price")
=FP.LIVE("platform", "model_123", "irr")
```
Streaming function that updates automatically when the source data changes.

#### FP.SENSITIVITY - Sensitivity Analysis
```excel
=FP.SENSITIVITY("B2", "D5", 10)  // 10 steps
```
Returns a sensitivity matrix showing how output varies with input changes.

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

### Phase 2: Database Integration (Completed)
- [x] Alembic migrations setup
- [x] PostgreSQL database schema
- [x] User authentication (JWT with bcrypt)
- [x] User registration and login
- [x] Model CRUD with PostgreSQL persistence
- [x] Role-based access control (Analyst, Stakeholder, Admin)
- [x] Authentication tests (8 tests)

### Phase 3: Real-time Collaboration (Completed)
- [x] WebSocket connection manager
- [x] User presence awareness (join/leave/cursor tracking)
- [x] Cell locking for conflict prevention
- [x] Real-time cell update broadcasting
- [x] Comments and annotations system
- [x] Threaded comments with resolution
- [x] Database models for collaboration
- [x] WebSocket tests (12 tests)
- [x] Total: 33 tests passing

### Phase 4: Financial Engine Enhancement (Completed)
- [x] 3-statement model (Income Statement, Balance Sheet, Cash Flow)
- [x] Operating model with revenue streams and cost drivers
- [x] 13-week cash flow for liquidity forecasting
- [x] Scenario management (Base, Upside, Downside, Custom)
- [x] Monte Carlo simulation support
- [x] Probability-weighted analysis
- [x] Sensitivity analysis framework
- [x] Financial models tests (23 tests)
- [x] Total: 56 tests passing

### Phase 5: Export & Reporting (Completed)
- [x] PDF report generation with ReportLab
- [x] PowerPoint export with python-pptx
- [x] LBO, 3-statement, 13-week report generators
- [x] Customizable report templates
- [x] Template management system (create, clone, import/export)
- [x] Charts and data visualization in exports
- [x] Export API endpoints
- [x] Export tests (28 tests)
- [x] Total: 84 tests passing

### Phase 6: Excel Add-in Completion (Completed)
- [x] Full sync engine with WebSocket support
- [x] IndexedDB offline storage for pending operations and cache
- [x] Custom function streaming (FP.LIVE)
- [x] Task pane UI with React and Fluent UI
- [x] Backend Excel API endpoints
- [x] Cell linking and bidirectional sync
- [x] Scenario value retrieval
- [x] Sensitivity analysis from Excel
- [x] Audit trail and comments integration
- [x] Excel API tests (21 tests)
- [x] Total: 105 tests passing

### Phase 7: Industry-Specific Models (Completed)
- [x] Sale-Leaseback Model (transaction analysis, NPV, coverage ratios)
- [x] REIT Valuation Model (FFO/AFFO, NAV, dividend analysis)
- [x] NAV Model (sum-of-the-parts, holding company discount)
- [x] Industry API endpoints with full analysis
- [x] Sensitivity analysis for all industry models
- [x] Industry model tests (21 tests)
- [x] Total: 126 tests passing

### Phase 8: Bespoke Transactions (Completed)
- [x] Spin-Off/Carve-Out Model (value creation, stranded costs, TSA)
- [x] IP Licensing Model (royalties, milestones, NPV valuation)
- [x] Reverse Morris Trust Model (tax efficiency, ownership, accretion)
- [x] Bespoke API endpoints with full analysis
- [x] Tax analysis and synergy calculations
- [x] Bespoke model tests (24 tests)
- [x] Total: 150 tests passing

### Phase 9: Due Diligence (Completed)
- [x] Vertical-specific workflows (Technology, Healthcare, Manufacturing, Real Estate)
- [x] Findings tracker with severity levels (Critical, High, Medium, Low, Info)
- [x] Quality of Earnings (QoE) analysis with adjustments
- [x] Risk matrix with likelihood/impact scoring (1-25 scale)
- [x] Recommendation engine with deal recommendations
- [x] Progress tracking for work items and document collection
- [x] Due diligence API endpoints
- [x] Due diligence tests (16 tests)
- [x] React frontend with tabbed interface
- [x] Findings Tracker component with CRUD operations
- [x] Risk Matrix component with 5x5 visual grid
- [x] QoE Calculator with EBITDA bridge visualization
- [x] Vertical-specific checklist component
- [x] DD Summary with recommendations display
- [x] Total: 166 tests passing

### Phase 10: Production Ready
- [ ] Performance optimization
- [ ] Security audit
- [ ] Accessibility compliance
- [ ] Documentation completion

## Environment Variables

```env
# Application
APP_NAME="Financial Modeling Platform"
DEBUG=true
API_V1_PREFIX=/api/v1

# Database
DATABASE_URL=postgresql+asyncpg://postgres:password@localhost:5432/finmodel
DATABASE_ECHO=false

# Redis
REDIS_URL=redis://localhost:6379/0

# Authentication
SECRET_KEY=your-super-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Storage (S3/MinIO)
S3_ENDPOINT_URL=
S3_ACCESS_KEY=
S3_SECRET_KEY=
S3_BUCKET_NAME=finmodel-storage

# CORS
ALLOWED_ORIGINS=["http://localhost:3000", "http://localhost:5173"]
```

## User Roles

| Role | Permissions |
|------|-------------|
| **Analyst** | Create, edit, delete models; manage scenarios; full model access |
| **Stakeholder** | View models and dashboards; add comments |
| **Admin** | Full access + user management |

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-model`)
3. Commit changes (`git commit -m 'Add new model'`)
4. Push to branch (`git push origin feature/new-model`)
5. Open a Pull Request

## License

MIT License - see LICENSE file for details.

## Financial Models

### 3-Statement Model

Integrated Income Statement, Balance Sheet, and Cash Flow Statement with full circular reference handling.

```python
from core.models import ThreeStatementModel, ThreeStatementInputs

inputs = ThreeStatementInputs(
    base_revenue=1_000_000,
    base_cogs=600_000,
    projection_years=5,
    revenue_growth_rates=[0.08, 0.07, 0.06, 0.05, 0.05],
    cogs_percent_revenue=[0.60, 0.59, 0.58, 0.58, 0.57],
    ar_days=45,
    inventory_days=50,
    ap_days=35,
    tax_rate=0.25,
)

model = ThreeStatementModel(model_id="3stmt-1", name="Company Forecast")
model.set_inputs(inputs)
result = model.calculate()

print(f"Year 5 Revenue: ${result.outputs['income_statement']['revenue'][-1]:,.0f}")
print(f"Year 5 Net Income: ${result.outputs['income_statement']['net_income'][-1]:,.0f}")
print(f"Average ROIC: {sum(result.outputs['metrics']['roic'])/5:.1%}")
```

### Operating Model

Detailed revenue build from product lines with cost drivers and headcount planning.

```python
from core.models import OperatingModel, OperatingInputs, RevenueStream, CostDriver

inputs = OperatingInputs(
    projection_years=5,
    revenue_streams=[
        RevenueStream(
            name="SaaS Subscriptions",
            base_units=1000,
            base_price=1200,
            unit_growth_rates=[0.20, 0.15, 0.12, 0.10, 0.08],
        ),
        RevenueStream(
            name="Professional Services",
            base_units=50,
            base_price=10000,
            unit_growth_rates=[0.10, 0.10, 0.08, 0.05, 0.05],
        ),
    ],
    cost_of_goods=[
        CostDriver(name="Hosting", variable_rate=0.15, variable_basis="revenue"),
        CostDriver(name="Support", fixed_amount=50000, inflation_rate=0.03),
    ],
    base_headcount=20,
    revenue_per_employee=150000,
    avg_salary=80000,
)

model = OperatingModel(model_id="op-1", name="SaaS Forecast")
model.set_inputs(inputs)
result = model.calculate()
```

### 13-Week Cash Flow

Short-term liquidity forecasting with revolver management.

```python
from core.models import CashFlow13WeekModel, CashFlowInputs, WeeklyCashInput

inputs = CashFlowInputs(
    beginning_cash=500_000,
    revolver_capacity=1_000_000,
    minimum_cash_buffer=100_000,
    base_weekly_collections=200_000,
    base_weekly_payables=80_000,
    payroll_amount=150_000,
    payroll_frequency="biweekly",
    debt_payments=[
        WeeklyCashInput(week=4, amount=100_000),
        WeeklyCashInput(week=8, amount=100_000),
    ],
)

model = CashFlow13WeekModel(model_id="13wk-1", name="Q1 Forecast")
model.set_inputs(inputs)
result = model.calculate()

print(f"Week 13 Ending Cash: ${result.outputs['liquidity']['ending_cash'][-1]:,.0f}")
print(f"Minimum Cash: ${result.outputs['metrics']['minimum_cash_amount']:,.0f}")
```

### Scenario Management

Create and compare scenarios with probability-weighted analysis.

```python
from core.engine import ScenarioManager, ScenarioType
from core.models import LBOModel, LBOInputs

base_inputs = LBOInputs(
    enterprise_value=500,
    sponsor_equity=200,
    exit_multiple=8.0,
    # ... other inputs
)

manager = ScenarioManager(base_inputs)

# Create scenarios
manager.create_scenario(
    name="Bull Case",
    scenario_type=ScenarioType.UPSIDE,
    assumptions={"exit_multiple": 10.0, "revenue_growth_rates": [0.08, 0.07, 0.06, 0.05, 0.05]},
    probability_weight=0.25,
)

manager.create_scenario(
    name="Bear Case",
    scenario_type=ScenarioType.DOWNSIDE,
    assumptions={"exit_multiple": 6.0},
    probability_weight=0.25,
)

# Compare scenarios
def calc_fn(inputs):
    model = LBOModel("temp", "temp")
    model.set_inputs(inputs)
    return model.calculate().outputs

comparison = manager.compare_scenarios(
    scenario_ids=[s.id for s in manager.list_scenarios()],
    calculate_fn=calc_fn,
    output_names=["irr", "moic"],
)

# Probability-weighted output
weighted = manager.probability_weighted_output(calc_fn, ["irr", "moic"])
print(f"Probability-Weighted IRR: {weighted['irr']:.1%}")
```

---

## Export Examples

### Generate LBO PDF Report

```bash
curl -X POST http://localhost:8001/api/v1/export/pdf/lbo \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Project Alpha LBO Analysis",
    "company_name": "Target Corp",
    "prepared_by": "Investment Team",
    "inputs": {
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
    }
  }' --output lbo_report.pdf
```

### Generate PowerPoint Presentation

```bash
curl -X POST http://localhost:8001/api/v1/export/pptx/lbo \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Investment Memo",
    "subtitle": "Project Alpha",
    "inputs": { ... }
  }' --output presentation.pptx
```

### List Available Templates

```bash
curl http://localhost:8001/api/v1/export/templates

# Filter by type
curl "http://localhost:8001/api/v1/export/templates?template_type=lbo&format=pdf"
```

---

## Excel Add-in Task Pane

The Excel add-in includes a full task pane UI built with React and Fluent UI:

### Home Tab
- Connection status indicator
- Quick function insertion
- Function reference guide

### Links Tab
- View all linked cells
- Refresh linked values
- Unlink cells
- Navigate to cells in workbook

### Sync Tab
- Online/offline status
- Pending operations count
- Force sync button
- Clear offline data

### Settings Tab
- User account management
- Dark/light theme toggle
- Auto-sync configuration
- API URL configuration

### Offline Support

The add-in supports full offline operation:

1. **IndexedDB Storage**: Pending operations are stored locally
2. **Cache**: Fetched values are cached for offline access
3. **Auto-Sync**: Changes sync automatically when connection is restored
4. **Conflict Resolution**: Last-write-wins with timestamp comparison

---

---

## Industry-Specific Models

### Sale-Leaseback Analysis

Analyze sale-leaseback transactions including proceeds, rent coverage, NPV, and financial impact.

```bash
curl -X POST http://localhost:8001/api/v1/industry/sale-leaseback/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "properties": [
      {
        "name": "Corporate HQ",
        "property_type": "office",
        "square_feet": 100000,
        "current_book_value": 20000000,
        "market_value": 30000000,
        "annual_noi": 2100000
      }
    ],
    "target_cap_rate": 0.07,
    "current_ebitda": 10000000,
    "annual_escalation_rate": 0.025,
    "projection_years": 15
  }'
```

**Response includes:**
- Portfolio summary (market value, NOI, implied cap rate)
- Transaction economics (proceeds, gain/loss, tax impact)
- Lease projections (annual rents, escalation)
- Coverage ratios (EBITDA coverage, FCCR)
- NPV analysis (breakeven year, IRR)
- Use of proceeds analysis

### REIT Valuation

Complete REIT analysis with FFO/AFFO, NAV, and dividend metrics.

```bash
curl -X POST http://localhost:8001/api/v1/industry/reit/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "shares_outstanding": 100000000,
    "current_share_price": 25.0,
    "total_noi": 150000000,
    "total_debt": 500000000,
    "rental_revenue": 200000000,
    "property_expenses": 50000000,
    "depreciation": 40000000,
    "target_payout_ratio": 0.75,
    "projection_years": 5
  }'
```

**Response includes:**
- FFO/AFFO calculation and per-share metrics
- Dividend analysis (yield, payout ratios, coverage)
- NAV calculation (premium/discount to market)
- Capital structure metrics (leverage ratios)
- Multi-year projections

### NAV Model (Sum-of-the-Parts)

Calculate Net Asset Value with holding company discount.

```bash
curl -X POST http://localhost:8001/api/v1/industry/nav/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "shares_outstanding": 100000000,
    "current_share_price": 15.0,
    "total_real_estate": 1000000000,
    "total_investments": 200000000,
    "cash_and_equivalents": 50000000,
    "total_debt": 400000000,
    "holding_company_discount": 0.10
  }'
```

**Response includes:**
- Asset valuation by type
- Liability valuation
- NAV components (GAV, liabilities, discounts)
- Per-share metrics (NAV/share, premium/discount)
- Sum-of-the-parts breakdown
- Sensitivity analysis

---

---

## Bespoke Transaction Models

### Spin-Off / Carve-Out Analysis

Analyze corporate spin-offs and carve-out IPOs with value creation analysis.

```bash
curl -X POST http://localhost:8001/api/v1/bespoke/spinoff/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "transaction_type": "spinoff",
    "spinco_name": "NewCo",
    "spinco_ebitda": 100000000,
    "spinco_debt": 50000000,
    "parent_ebitda": 400000000,
    "parent_debt": 200000000,
    "spinco_ebitda_multiple": 10.0,
    "parent_ebitda_multiple": 8.0,
    "stranded_cost_amount": 15000000,
    "transaction_costs": 5000000
  }'
```

**Response includes:**
- Pro-forma financials for both entities
- Value creation from multiple expansion
- Stranded cost analysis and mitigation schedule
- Capital structure optimization
- TSA (Transition Service Agreement) impact

### IP Licensing Analysis

Value intellectual property licensing deals with NPV analysis.

```bash
curl -X POST http://localhost:8001/api/v1/bespoke/ip-licensing/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "ip_type": "patent",
    "ip_name": "Core Technology Portfolio",
    "license_type": "exclusive",
    "license_term_years": 10,
    "royalty_rate": 0.05,
    "upfront_fee": 5000000,
    "licensee_base_revenue": 100000000,
    "licensee_revenue_growth": 0.10,
    "discount_rate": 0.12
  }'
```

**Response includes:**
- Royalty projections over license term
- NPV of royalty stream
- Milestone payment analysis
- Comparable transaction analysis
- Risk analysis by IP and license type

### Reverse Morris Trust (RMT) Analysis

Analyze tax-efficient spin-merger combinations.

```bash
curl -X POST http://localhost:8001/api/v1/bespoke/rmt/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "spinco_name": "SpinCo",
    "acquirer_name": "Acquirer Inc",
    "spinco_ebitda": 200000000,
    "spinco_debt": 100000000,
    "spinco_assets": 800000000,
    "spinco_tax_basis": 300000000,
    "acquirer_ebitda": 150000000,
    "acquirer_shares": 100000000,
    "acquirer_share_price": 25.0,
    "cost_synergies": 30000000,
    "corporate_tax_rate": 0.25
  }'
```

**Response includes:**
- Ownership analysis (>50% requirement for tax-free)
- Tax savings calculation
- Synergy phase-in schedule
- Accretion/dilution analysis
- Pro-forma combined financials

---

## Due Diligence Module

### Comprehensive DD Analysis

Run full due diligence analysis with findings, QoE, and risk assessment.

```bash
curl -X POST http://localhost:8001/api/v1/due-diligence/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "target_name": "Target Corp",
    "transaction_type": "acquisition",
    "deal_value": 500000000,
    "vertical": "technology",
    "current_phase": "phase_1",
    "reported_ebitda": 50000000,
    "findings": [
      {
        "id": "f1",
        "category": "financial",
        "severity": "high",
        "title": "Revenue Recognition",
        "description": "Non-standard revenue recognition practices identified",
        "impact_amount": 2000000,
        "status": "open"
      }
    ],
    "risks": [
      {
        "id": "r1",
        "category": "commercial",
        "title": "Customer Concentration",
        "description": "Top 3 customers represent 60% of revenue",
        "likelihood": "possible",
        "impact": "major"
      }
    ]
  }'
```

**Response includes:**
- Vertical-specific checklist with categories
- Findings summary by severity (critical/high/medium/low)
- QoE adjustments and adjusted EBITDA
- Risk matrix with weighted scores
- Progress tracking
- Deal recommendations (Proceed/Proceed with Caution/Do Not Proceed)

### Vertical-Specific Checklists

Get DD checklist tailored to industry vertical.

```bash
# Technology vertical
curl -X POST http://localhost:8001/api/v1/due-diligence/checklist/technology

# Healthcare vertical
curl -X POST http://localhost:8001/api/v1/due-diligence/checklist/healthcare

# Manufacturing vertical
curl -X POST http://localhost:8001/api/v1/due-diligence/checklist/manufacturing

# Real Estate vertical
curl -X POST http://localhost:8001/api/v1/due-diligence/checklist/real_estate
```

**Available verticals:**
- `technology` - IP, cybersecurity, tech stack assessment
- `healthcare` - HIPAA, FDA, clinical operations
- `manufacturing` - Supply chain, equipment, environmental
- `real_estate` - Property, tenant, environmental
- `financial_services` - Regulatory, compliance, risk
- `retail` - Inventory, locations, e-commerce
- `general` - Standard DD checklist

### Quality of Earnings (QoE)

Calculate adjusted EBITDA with QoE adjustments.

```bash
curl -X POST http://localhost:8001/api/v1/due-diligence/qoe \
  -H "Content-Type: application/json" \
  -d '{
    "reported_ebitda": 10000000,
    "adjustments": [
      {
        "id": "q1",
        "category": "One-time",
        "description": "Legal settlement expense",
        "amount": 500000,
        "is_addback": true,
        "is_recurring": false,
        "confidence_level": 0.95
      },
      {
        "id": "q2",
        "category": "Owner",
        "description": "Above-market owner compensation",
        "amount": 200000,
        "is_addback": true,
        "is_recurring": true,
        "confidence_level": 0.90
      }
    ]
  }'
```

**Response:**
```json
{
  "success": true,
  "qoe_analysis": {
    "reported_ebitda": 10000000,
    "total_addbacks": 700000,
    "total_deductions": 0,
    "adjusted_ebitda": 10700000,
    "adjustment_count": 2,
    "confidence_weighted_ebitda": 10665000
  }
}
```

### Risk Matrix

Calculate risk scores using likelihood × impact matrix.

```bash
curl -X POST http://localhost:8001/api/v1/due-diligence/risk-matrix \
  -H "Content-Type: application/json" \
  -d '{
    "risks": [
      {
        "id": "r1",
        "category": "commercial",
        "title": "Customer concentration",
        "description": "Top 3 customers = 60% revenue",
        "likelihood": "possible",
        "impact": "major"
      },
      {
        "id": "r2",
        "category": "technology",
        "title": "Legacy systems",
        "description": "Core systems need replacement",
        "likelihood": "likely",
        "impact": "moderate"
      }
    ]
  }'
```

**Risk scoring:**
- Likelihood: rare (1), unlikely (2), possible (3), likely (4), almost_certain (5)
- Impact: minor (1), moderate (2), major (3), severe (4), catastrophic (5)
- Risk score = likelihood × impact (1-25 scale)
- Categories: critical (20-25), high (12-19), medium (6-11), low (1-5)

### Findings Summary

Summarize DD findings by severity and category.

```bash
curl -X POST http://localhost:8001/api/v1/due-diligence/findings/summarize \
  -H "Content-Type: application/json" \
  -d '[
    {
      "id": "f1",
      "category": "financial",
      "severity": "critical",
      "title": "Revenue Recognition Issue",
      "description": "Material revenue misstatement",
      "impact_amount": 5000000,
      "status": "open"
    },
    {
      "id": "f2",
      "category": "legal",
      "severity": "high",
      "title": "Pending Litigation",
      "description": "Material lawsuit in progress",
      "impact_amount": 2000000,
      "status": "in_review"
    }
  ]'
```

**Response:**
```json
{
  "success": true,
  "findings_summary": {
    "total_findings": 2,
    "critical": 1,
    "high": 1,
    "medium": 0,
    "low": 0,
    "info": 0,
    "total_quantified_impact": 7000000,
    "open_findings": 1,
    "by_category": {
      "financial": 1,
      "legal": 1
    }
  }
}
```

### DD Recommendations

Get deal recommendations based on findings and risks.

```bash
curl -X POST http://localhost:8001/api/v1/due-diligence/recommendations \
  -H "Content-Type: application/json" \
  -d '{
    "target_name": "Target Corp",
    "reported_ebitda": 10000000,
    "findings": [...],
    "risks": [...],
    "qoe_adjustments": [...]
  }'
```

**Deal recommendations:**
- `PROCEED` - No significant issues identified
- `PROCEED_WITH_CAUTION` - Issues identified, mitigation required
- `DO_NOT_PROCEED` - Critical issues, deal not recommended

---

**Current Status**: Phase 9 Complete - Due Diligence module with full backend API and React frontend. Features include vertical-specific workflows, findings tracker, QoE analysis, risk matrix visualization, and recommendation engine. 166 backend tests passing.
