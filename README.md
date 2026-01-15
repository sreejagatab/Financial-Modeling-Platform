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
│   │   └── deals/             # LBO, M&A analysis
│   ├── core/                  # Business logic
│   │   ├── engine/            # Calculation engine
│   │   │   ├── base_model.py  # Abstract financial model
│   │   │   └── calculation_graph.py  # Dependency DAG
│   │   └── models/            # Model implementations
│   │       └── lbo_model.py   # LBO with returns
│   ├── db/models/             # SQLAlchemy models
│   ├── alembic/               # Database migrations
│   ├── services/              # Business services
│   │   ├── auth_service.py    # Authentication logic
│   │   ├── model_service.py   # Model CRUD operations
│   │   ├── websocket_manager.py  # WebSocket connections
│   │   └── collaboration_service.py  # Comments/annotations
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

# Run all tests (33 tests)
pytest tests/ -v

# Run specific test file
pytest tests/test_lbo_model.py -v
pytest tests/test_auth.py -v
pytest tests/test_websocket.py -v

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

### Phase 4: Additional Models (Next)
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

---

**Current Status**: Phase 3 Complete - Real-time collaboration with WebSocket, presence awareness, cell locking, and comments/annotations. 33 tests passing.
